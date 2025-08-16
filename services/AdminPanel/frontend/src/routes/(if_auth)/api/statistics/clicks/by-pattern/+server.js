import { getMongoCollection, connectMongoDB } from '$lib/server/mongoService';
import { error } from '@sveltejs/kit';

export async function GET({ url }) {
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

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
                    _id: "$pattern",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ];

        const result = await collection.aggregate(pipeline).toArray();
        return new Response(JSON.stringify(result.map(item => ({ pattern: item._id, count: item.count }))), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        console.error("Error fetching clicks by pattern:", err);
        error(500, 'Internal Server Error');
    }
}