import { json } from '@sveltejs/kit';
import { getMongoCollection, connectMongoDB } from '$lib/server/mongoService';

export async function GET({ url }) {
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const limit = url.searchParams.get('limit') || 10;

    if (!startDate || !endDate) {
        return json({ error: 'Требуются параметры startDate и endDate.' }, { status: 400 });
    }

    try {
        await connectMongoDB();
        const collection = getMongoCollection('interactions');
        
        const startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);

        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
            return json({ error: 'Неверный формат даты. Используйте ISO 8601.' }, { status: 400 });
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
                    _id: "$user_id",
                    interactionCount: { $sum: 1 }
                }
            },
            {
                $sort: { interactionCount: -1 }
            },
            {
                $limit: parseInt(limit)
            },
            {
                $lookup: {
                    from: 'tbpv6.users',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: {
                    path: '$userDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 0,
                    user_id: "$_id",
                    interactionCount: 1,
                    username: "$userDetails.username",
                    first_name: "$userDetails.first_name",
                    last_name: "$userDetails.last_name"
                }
            }
        ];

        const result = await collection.aggregate(pipeline).toArray();
        return json(result);

    } catch (err) {
        console.error('Error fetching most active users:', err);
        return json({ error: err.message || 'Внутренняя ошибка сервера.' }, { status: 500 });
    }
}