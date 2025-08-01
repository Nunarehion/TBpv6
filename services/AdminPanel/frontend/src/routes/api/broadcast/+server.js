import { json } from '@sveltejs/kit';
import { getRedisClient } from '$lib/server/redisService';

const BROADCAST_CHANNEL = 'tbpv6_broadcast_channel'; 

export async function POST({ request }) {
    const { message_name } = await request.json();

    if (!message_name) {
        return json({ error: 'Требуется параметр message_name для рассылки.' }, { status: 400 });
    }

    try {
        const redisClient = getRedisClient();
        const messagePayload = JSON.stringify({ message_name: message_name });
        await redisClient.publish(BROADCAST_CHANNEL, messagePayload);
        console.log(`Published broadcast message for '${message_name}' to Redis channel '${BROADCAST_CHANNEL}'`);
        return json({ success: true, message: 'Запрос на рассылку отправлен.' });
    } catch (err) {
        console.error(`Error publishing broadcast message for ${message_name}:`, err);
        return json({ error: 'Внутренняя ошибка сервера при рассылке.' }, { status: 500 });
    }
}