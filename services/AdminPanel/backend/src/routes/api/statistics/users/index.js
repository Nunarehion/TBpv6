import { Router } from 'express';
import { getCollection } from '../../../../config/db.js';

import activeOverTimeRouter from './active-over-time.js';
import mostActiveRouter from './most-active.js';
import newOverTimeRouter from './new-over-time.js';

const router = Router();

router.get('/total', async (req, res, next) => { 
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
    next(err);
  }
});


router.use('/active-over-time', activeOverTimeRouter);
router.use('/most-active', mostActiveRouter);
router.use('/new-over-time', newOverTimeRouter);

export default router;