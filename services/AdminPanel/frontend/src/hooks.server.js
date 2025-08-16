import { connectMongoDB, Admin } from '$lib/server/mongoService';
import { connectRedis } from '$lib/server/redisService';
import { sequence } from '@sveltejs/kit/hooks';

let dbInitialized = false;
let redisInitialized = false;

const ADMIN_SESSION_COOKIE = 'admin_session';

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

    const sessionCookieValue = event.cookies.get(ADMIN_SESSION_COOKIE);
    
    if (sessionCookieValue) {
        const admin = await Admin.findOne({ username: sessionCookieValue });
        event.locals.isAdmin = !!admin;
    } else {
        event.locals.isAdmin = false;
    }
    
    const response = await resolve(event);
    return response;
});