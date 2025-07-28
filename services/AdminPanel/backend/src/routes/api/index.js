import { Router } from 'express';
import mongoose from 'mongoose';

// --- импорты роутеров ---
import broadcastRouter from './broadcast.js';
import collectionRoutes from './$collectionName.js';
import imageRoutes from './images.js';

// Статистика кликов - ИМПОРТИРУЙТЕ ТОЛЬКО ГЛАВНЫЙ clicks/index.js
import clicksStatisticsRouter from './statistics/clicks/index.js'; // <-- Добавьте этот импорт

// Статистика пользователей
import usersStatisticsRouter from './statistics/users/index.js';

const apiRouter = Router();

// --- Основной маршрут /api/ (список коллекций) ---
apiRouter.get('/', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const names = collections.map(col => col.name);
    res.json(names);
  } catch (err) {
    console.error('Error listing collections:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Подключение роутеров Broadcast ---
apiRouter.use('/broadcast', broadcastRouter);

// --- Подключение роутеров изображений ---
apiRouter.use('/images', imageRoutes);

// --- Подключение роутеров коллекций ---
apiRouter.use('/', collectionRoutes);

// --- Подключение роутеров статистики ---
// ИЗМЕНЕНИЕ ЗДЕСЬ: МОНТИРУЕМ ТОЛЬКО clicksStatisticsRouter по базовому пути
apiRouter.use('/statistics/clicks', clicksStatisticsRouter); // <-- ОДНА ЭТА СТРОКА

// Удалите эти строки, они теперь не нужны здесь, так как
// они будут монтироваться внутри clicks/index.js
// import clicksByPatternRouter from './statistics/clicks/by-pattern.js';
// import clicksTimeSeriesRouter from './statistics/clicks/time-series.js';
// apiRouter.use('/statistics/clicks/by-pattern', clicksByPatternRouter);
// apiRouter.use('/statistics/clicks/time-series', clicksTimeSeriesRouter);

apiRouter.use('/statistics/users', usersStatisticsRouter);

export default apiRouter;