import Redis from 'ioredis';

const REDIS_HOST = 'redis';
const REDIS_PORT = 6379;
export const BROADCAST_CHANNEL = 'broadcast_channel';

const redisClient = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    lazyConnect: true
});

let isConnected = false;

export async function connectRedis() {
    if (isConnected && redisClient.status === 'ready') {
        return redisClient;
    }
    
    return new Promise((resolve, reject) => {
        redisClient.on('connect', () => {
            console.log('Redis connected');
            isConnected = true;
            resolve(redisClient);
        });

        redisClient.on('error', (err) => {
            console.error('Redis connection error:', err);
            isConnected = false;
            if (redisClient.status === 'connecting') {
                reject(err);
            }
        });

        redisClient.connect().catch(err => {
            if (redisClient.status !== 'ready' && redisClient.status !== 'connecting') {
                console.error('Failed to connect to Redis initially:', err);
                reject(err);
            }
        });
    });
}

export function getRedisClient() {
    if (!isConnected || redisClient.status !== 'ready') {
        throw new Error('Redis client not connected. Call connectRedis() first and ensure it resolves.');
    }
    return redisClient;
}