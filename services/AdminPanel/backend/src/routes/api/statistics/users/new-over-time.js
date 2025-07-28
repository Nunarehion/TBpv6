import { Router } from 'express';
import mongoose from '../../../../config/db.js'; // Импортируем mongoose для прямого доступа к коллекциям

const router = Router();

router.get('/', async (req, res, next) => {
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
    next(err); 
  }
});

export default router;