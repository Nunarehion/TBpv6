import { connectMongoDB } from '$lib/server/mongoService';
import { connectRedis } from '$lib/server/redisService';
import { sequence } from '@sveltejs/kit/hooks';

let dbInitialized = false;
let redisInitialized = false;

export const handle = sequence(async ({ event, resolve }) => {
    if (!dbInitialized) {
        try {
            await connectMongoDB();
            dbInitialized = true;
        } catch (error) {
            console.error("Failed to initialize database connection:", error);
        }
    }

    if (!redisInitialized) {
        try {
            await connectRedis();
            redisInitialized = true;
        } catch (error) {
            console.error("Failed to initialize Redis connection:", error);
        }
    }

    const response = await resolve(event);
    return response;
});

export function handleError({ error, event }) {
    console.error(`An unhandled server error occurred on ${event.url.pathname}:`, error);
    return {
        message: 'Произошла внутренняя ошибка сервера.',
        code: error.code ?? 'UNKNOWN_SERVER_ERROR'
    };
}