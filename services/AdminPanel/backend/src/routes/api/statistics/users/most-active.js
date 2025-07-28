import { Router } from 'express';
import { getCollection } from '../../../../config/db.js';
import mongoose from '../../../../config/db.js'; // Для lookup-а на tbpv6.users

const router = Router();

router.get('/', async (req, res, next) => {
  const { startDate, endDate, limit = 10 } = req.query;

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
            from: 'tbpv6.users', // Обратите внимание: имя коллекции в lookup должно быть полным
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
    next(err); 
  }
});

export default router;