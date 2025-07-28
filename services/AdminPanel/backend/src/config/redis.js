import Redis from 'ioredis';

const REDIS_HOST = 'redis';
const REDIS_PORT = 6379;
export const BROADCAST_CHANNEL = 'broadcast_channel';

export const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  lazyConnect: true
});

export const connectRedis = () => {
  redis.on('connect', () => console.log('Redis connected'));
  redis.on('error', err => console.error('Redis connection error:', err));
  redis.connect().catch(err => {
    console.error('Failed to connect to Redis initially:', err);
  });
};