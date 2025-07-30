import { Router } from 'express';
import { redis, BROADCAST_CHANNEL } from '../../config/redis.js';

const router = Router();

router.post('/', async (req, res, next) => {
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
    next(err);
  }
});

export default router;