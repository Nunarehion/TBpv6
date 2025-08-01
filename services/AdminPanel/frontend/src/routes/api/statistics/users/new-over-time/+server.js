import { json } from '@sveltejs/kit';
import { getMongoCollection, connectMongoDB } from '$lib/server/mongoService';

export async function GET({ url }) {
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const interval = url.searchParams.get('interval');

    if (!startDate || !endDate || !interval) {
        return json({ error: 'Требуются параметры startDate, endDate и interval.' }, { status: 400 });
    }

    try {
        await connectMongoDB();
        const interactionsCollection = getMongoCollection('interactions');

        const startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);

        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
            return json({ error: 'Неверный формат даты. Используйте ISO 8601.' }, { status: 400 });
        }

        let dateFormat;
        if (interval === 'hour') {
            dateFormat = '%Y-%m-%dT%H:00:00Z';
        } else if (interval === 'day') {
            dateFormat = '%Y-%m-%dT00:00:00Z';
        } else if (interval === 'month') {
            dateFormat = '%Y-%m-01T00:00:00Z';
        } else {
            return json({ error: 'Неверный интервал. Допустимые значения: "hour", "day", "month".' }, { status: 400 });
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
                    firstInteraction: { $min: "$timestamp" }
                }
            },
            {
                $match: {
                    firstInteraction: {
                        $gte: startDateTime,
                        $lte: endDateTime
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: "$firstInteraction" } },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ];
        const result = await interactionsCollection.aggregate(pipeline).toArray();
        return json(result.map(item => ({ time: new Date(item._id), count: item.count })));

    } catch (err) {
        console.error('Error fetching new users over time:', err);
        return json({ error: err.message || 'Внутренняя ошибка сервера.' }, { status: 500 });
    }
}