import { Router } from 'express';
import { getCollection } from '../../../../config/db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  const { startDate, endDate, interval } = req.query;

  if (!startDate || !endDate || !interval) {
    return res.status(400).json({ error: 'Требуются параметры startDate, endDate и interval.' });
  }

  try {
    const collection = getCollection('interactions');
    
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
    next(err); 
  }
});

export default router;