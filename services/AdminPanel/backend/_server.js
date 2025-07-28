import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { ObjectId } from 'mongodb';
import Redis from 'ioredis';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const MONGO_URI = 'mongodb://mongodb:27017/tbpv6';
const REDIS_HOST = 'redis';
const REDIS_PORT = 6379;
const BROADCAST_CHANNEL = 'broadcast_channel';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  lazyConnect: true
});

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', err => console.error('Redis connection error:', err));

redis.connect().catch(err => {
  console.error('Failed to connect to Redis initially:', err);
});


app.get('/api', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const names = collections.map(col => col.name);
    res.json(names);
  } catch (err) {
    console.error('Error listing collections:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/broadcast', async (req, res) => {
  const { message_name } = req.body;

  if (!message_name) {
    return res.status(400).json({ error: 'Требуется параметр message_name для рассылки.' });
  }

  try {
    const messagePayload = JSON.stringify({ message_name: message_name });
    await redis.publish(BROADCAST_CHANNEL, messagePayload);
    console.log(`Published broadcast message for '${message_name}' to Redis channel '${BROADCAST_CHANNEL}'`);
    res.json({ success: true, message: 'Запрос на рассылку отправлен.' });
  } catch (err) {
    console.error('Error publishing broadcast message to Redis:', err);
    res.status(500).json({ error: 'Internal server error or Redis connection issue.' });
  }
});

app.get('/api/:collectionName', async (req, res) => {
  const { collectionName } = req.params;

  try {
    const collection = mongoose.connection.db.collection(collectionName);
    const documents = await collection.find({}).sort({ _id: -1 }).toArray();
    res.json(documents);
  } catch (err) {
    console.error(`Error fetching documents from ${collectionName}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/statistics/clicks', async (req, res) => {
  const { startDate, endDate, pattern } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Требуются параметры startDate и endDate.' });
  }

  try {
    const collection = mongoose.connection.db.collection('interactions');
    
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return res.status(400).json({ error: 'Неверный формат даты. Используйте ISO 8601 (например, YYYY-MM-DDTHH:mm:ssZ).' });
    }

    const query = {
      timestamp: {
        $gte: startDateTime,
        $lte: endDateTime
      }
    };

    if (pattern) {
      query.pattern = pattern;
    }

    const clickCount = await collection.countDocuments(query);

    res.json({ count: clickCount, startDate: startDateTime, endDate: endDateTime, pattern: pattern || 'all' });

  } catch (err) {
    console.error('Error fetching click statistics:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/statistics/clicks/time-series', async (req, res) => {
  const { startDate, endDate, interval } = req.query;

  if (!startDate || !endDate || !interval) {
    return res.status(400).json({ error: 'Требуются параметры startDate, endDate и interval.' });
  }

  try {
    const collection = mongoose.connection.db.collection('interactions');
    
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return res.status(400).json({ error: 'Неверный формат даты. Используйте ISO 8601.' });
    }

    let dateFormat;
    if (interval === 'second') {
      dateFormat = '%Y-%m-%dT%H:%M:%SZ';
    } else if (interval === 'minute') {
      dateFormat = '%Y-%m-%dT%H:%MZ';
    } else if (interval === 'hour') {
      dateFormat = '%Y-%m-%dT%H:00:00Z';
    } else if (interval === 'day') {
      dateFormat = '%Y-%m-%dT00:00:00Z';
    } else if (interval === 'month') {
      dateFormat = '%Y-%m-01T00:00:00Z';
    } else {
      return res.status(400).json({ error: 'Неверный интервал. Допустимые значения: "second", "minute", "hour", "day", "month".' });
    }

    const pipeline = [
      {
        $match: {
          timestamp: {
            $gte: startDateTime,
            $lte: endDateTime
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$timestamp" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    res.json(result.map(item => ({ time: new Date(item._id), count: item.count })));

  } catch (err) {
    console.error('Error fetching time-series click statistics:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/statistics/clicks/by-pattern', async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Требуются параметры startDate и endDate.' });
  }

  try {
    const collection = mongoose.connection.db.collection('interactions');
    
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return res.status(400).json({ error: 'Неверный формат даты. Используйте ISO 8601.' });
    }

    const pipeline = [
      {
        $match: {
          timestamp: {
            $gte: startDateTime,
            $lte: endDateTime
          }
        }
      },
      {
        $group: {
          _id: "$pattern",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    res.json(result.map(item => ({ pattern: item._id, count: item.count })));

  } catch (err) {
    console.error('Error fetching click statistics by pattern:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/statistics/users/total', async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Требуются параметры startDate и endDate.' });
  }

  try {
    const collection = mongoose.connection.db.collection('interactions');
    
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return res.status(400).json({ error: 'Неверный формат даты. Используйте ISO 8601.' });
    }

    const pipeline = [
      {
        $match: {
          timestamp: {
            $gte: startDateTime,
            $lte: endDateTime
          }
        }
      },
      {
        $group: {
          _id: "$user_id"
        }
      },
      {
        $count: "totalUsers"
      }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    const totalUsers = result.length > 0 ? result[0].totalUsers : 0;

    res.json({ count: totalUsers, startDate: startDateTime, endDate: endDateTime });

  } catch (err) {
    console.error('Error fetching total user statistics:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/statistics/users/new-over-time', async (req, res) => {
  const { startDate, endDate, interval } = req.query;

  if (!startDate || !endDate || !interval) {
    return res.status(400).json({ error: 'Требуются параметры startDate, endDate и interval.' });
  }

  try {
    const usersCollection = mongoose.connection.db.collection('tbpv6.users');
    const interactionsCollection = mongoose.connection.db.collection('interactions');

    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return res.status(400).json({ error: 'Неверный формат даты. Используйте ISO 8601.' });
    }

    let dateFormat;
    if (interval === 'second') {
      dateFormat = '%Y-%m-%dT%H:%M:%SZ';
    } else if (interval === 'minute') {
      dateFormat = '%Y-%m-%dT%H:%MZ';
    } else if (interval === 'hour') {
      dateFormat = '%Y-%m-%dT%H:00:00Z';
    } else if (interval === 'day') {
      dateFormat = '%Y-%m-%dT00:00:00Z';
    } else if (interval === 'month') {
      dateFormat = '%Y-%m-01T00:00:00Z';
    } else {
      return res.status(400).json({ error: 'Неверный интервал. Допустимые значения: "second", "minute", "hour", "day", "month".' });
    }

    let pipeline;
    const collections = await mongoose.connection.db.listCollections({ name: 'tbpv6.users' }).toArray();
    if (collections.length > 0) {
        pipeline = [
            {
                $match: {
                    first_interaction_date: {
                        $gte: startDateTime,
                        $lte: endDateTime
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: "$first_interaction_date" } },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ];
        const result = await usersCollection.aggregate(pipeline).toArray();
        res.json(result.map(item => ({ time: new Date(item._id), count: item.count })));
    } else {
        pipeline = [
            {
                $match: {
                    timestamp: {
                        $gte: startDateTime,
                        $lte: endDateTime
                    }
                }
            },
            {
                $group: {
                    _id: "$user_id",
                    firstInteraction: { $min: "$timestamp" }
                }
            },
            {
                $match: {
                    firstInteraction: {
                        $gte: startDateTime,
                        $lte: endDateTime
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: "$firstInteraction" } },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ];
        const result = await interactionsCollection.aggregate(pipeline).toArray();
        res.json(result.map(item => ({ time: new Date(item._id), count: item.count })));
    }

  } catch (err) {
    console.error('Error fetching new users over time statistics:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/statistics/users/active-over-time', async (req, res) => {
  const { startDate, endDate, interval } = req.query;

  if (!startDate || !endDate || !interval) {
    return res.status(400).json({ error: 'Требуются параметры startDate, endDate и interval.' });
  }

  try {
    const collection = mongoose.connection.db.collection('interactions');
    
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return res.status(400).json({ error: 'Неверный формат даты. Используйте ISO 8601.' });
    }

    let dateFormat;
    if (interval === 'second') {
      dateFormat = '%Y-%m-%dT%H:%M:%SZ';
    } else if (interval === 'minute') {
      dateFormat = '%Y-%m-%dT%H:%MZ';
    } else if (interval === 'hour') {
      dateFormat = '%Y-%m-%dT%H:00:00Z';
    } else if (interval === 'day') {
      dateFormat = '%Y-%m-%dT00:00:00Z';
    } else if (interval === 'month') {
      dateFormat = '%Y-%m-01T00:00:00Z';
    } else {
      return res.status(400).json({ error: 'Неверный интервал. Допустимые значения: "second", "minute", "hour", "day", "month".' });
    }

    const pipeline = [
      {
        $match: {
          timestamp: {
            $gte: startDateTime,
            $lte: endDateTime
          }
        }
      },
      {
        $group: {
          _id: {
            timeBucket: { $dateToString: { format: dateFormat, date: "$timestamp" } },
            userId: "$user_id"
          }
        }
      },
      {
        $group: {
          _id: "$_id.timeBucket",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    res.json(result.map(item => ({ time: new Date(item._id), count: item.count })));

  } catch (err) {
    console.error('Error fetching active users over time statistics:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/statistics/users/most-active', async (req, res) => {
  const { startDate, endDate, limit = 10 } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Требуются параметры startDate и endDate.' });
  }

  try {
    const collection = mongoose.connection.db.collection('interactions');
    
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return res.status(400).json({ error: 'Неверный формат даты. Используйте ISO 8601.' });
    }

    const pipeline = [
      {
        $match: {
          timestamp: {
            $gte: startDateTime,
            $lte: endDateTime
          }
        }
      },
      {
        $group: {
          _id: "$user_id",
          interactionCount: { $sum: 1 }
        }
      },
      {
        $sort: { interactionCount: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $lookup: {
            from: 'tbpv6.users',
            localField: '_id',
            foreignField: 'user_id',
            as: 'userDetails'
        }
      },
      {
          $unwind: {
              path: '$userDetails',
              preserveNullAndEmptyArrays: true
          }
      },
      {
        $project: {
          _id: 0,
          user_id: "$_id",
          interactionCount: 1,
          username: "$userDetails.username",
          first_name: "$userDetails.first_name",
          last_name: "$userDetails.last_name"
        }
      }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    res.json(result);

  } catch (err) {
    console.error('Error fetching most active users statistics:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.get('/api/schema/:collectionName', async (req, res) => {
  const { collectionName } = req.params;
  try {
    const collection = mongoose.connection.db.collection(collectionName);
    const sampleDocs = await collection.find().limit(100).toArray();
    const keys = new Set();
    sampleDocs.forEach(doc => {
      Object.keys(doc).forEach(key => {
        if (key !== '_id') keys.add(key);
      });
    });
    res.json(Array.from(keys));
  } catch (e) {
    console.error('Ошибка при получении схемы:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/:collectionName/:id', async (req, res) => {
  const { collectionName, id } = req.params;
  const updateData = req.body;

  try {
    const collection = mongoose.connection.db.collection(collectionName);
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error(`Error updating document in ${collectionName}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/:collectionName/:id', async (req, res) => {
  const { collectionName, id } = req.params;

  try {
    const collection = mongoose.connection.db.collection(collectionName);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Документ не найден' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(`Ошибка при удалении из ${collectionName}:`, err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.post('/api/:collectionName', async (req, res) => {
  const { collectionName } = req.params;
  const newDocument = req.body;

  try {
    const collection = mongoose.connection.db.collection(collectionName);
    const result = await collection.insertOne({
      ...newDocument,
      created_at: new Date()
    });

    res.status(201).json({ success: true, insertedId: result.insertedId });
  } catch (err) {
    console.error(`Error inserting document into ${collectionName}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

