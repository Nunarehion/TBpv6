import { Router } from 'express';
import { getCollection } from '../../../../config/db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Требуются параметры startDate и endDate.' });
  }

  try {
    const collection = getCollection('interactions');
    
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
    next(err); 
  }
});

export default router;