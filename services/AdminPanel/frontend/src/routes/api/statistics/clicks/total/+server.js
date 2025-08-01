// services/AdminPanel/frontend/src/routes/api/statistics/clicks/total/+server.js

import { getMongoCollection, connectMongoDB } from '$lib/server/mongoService';
import { error } from '@sveltejs/kit';

export async function GET({ url }) {
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const pattern = url.searchParams.get('pattern');

    if (!startDate || !endDate) {
        error(400, 'Требуются параметры startDate и endDate.');
    }

    try {
        await connectMongoDB();
        const collection = getMongoCollection('interactions');

        const startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);

        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
            error(400, 'Неверный формат даты. Используйте ISO 8601.');
        }

        const matchStage = {
            timestamp: {
                $gte: startDateTime,
                $lte: endDateTime
            }
        };

        if (pattern) {
            matchStage.pattern = pattern;
        }

        const pipeline = [
            {
                $match: matchStage
            },
            {
                $count: 'totalClicks'
            }
        ];

        const result = await collection.aggregate(pipeline).toArray();
        const totalClicks = result.length > 0 ? result[0].totalClicks : 0;

        return new Response(JSON.stringify({ count: totalClicks }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        console.error("Error fetching total clicks:", err);
        error(500, 'Internal Server Error');
    }
}