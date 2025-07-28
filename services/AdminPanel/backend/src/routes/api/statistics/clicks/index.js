import { Router } from 'express';
import { getCollection } from '../../../../config/db.js';

// Импортируем под-роутеры для статистики кликов
import clicksByPatternRouter from './by-pattern.js'; // <-- Добавьте этот импорт
import clicksTimeSeriesRouter from './time-series.js'; // <-- Добавьте этот импорт


const router = Router();

router.get('/', async (req, res, next) => {
  const { startDate, endDate, pattern } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Требуются параметры startDate и endDate.' });
  }

  try {
    const collection = getCollection('interactions');

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
    next(err);
  }
});

// Монтируем под-роутеры ОТНОСИТЕЛЬНО этого роутера
router.use('/by-pattern', clicksByPatternRouter);   // Будет /statistics/clicks/by-pattern
router.use('/time-series', clicksTimeSeriesRouter); // Будет /statistics/clicks/time-series

export default router;