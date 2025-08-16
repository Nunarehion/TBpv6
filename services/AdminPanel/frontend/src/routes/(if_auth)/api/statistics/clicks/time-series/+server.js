// services/AdminPanel/frontend/src/routes/api/statistics/clicks/time-series/+server.js

import { getMongoCollection, connectMongoDB } from '$lib/server/mongoService';
import { error } from '@sveltejs/kit';

export async function GET({ url }) {
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const interval = url.searchParams.get('interval');

    if (!startDate || !endDate || !interval) {
        error(400, 'Требуются параметры startDate, endDate и interval.');
    }

    try {
        await connectMongoDB();
        const collection = getMongoCollection('interactions');

        const startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);

        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
            error(400, 'Неверный формат даты. Используйте ISO 8601.');
        }

        let truncUnit;
        let binSize = 1; // Default binSize is 1 for standard intervals

        // Determine the truncation unit and bin size for $dateTrunc
        switch (interval) {
            case 'second':
                truncUnit = 'second'; break;
            case '15_seconds':
                truncUnit = 'second'; binSize = 15;
                break;
            case 'minute':
                truncUnit = 'minute'; break;
            case '10_minutes':
                truncUnit = 'minute'; binSize = 10;
                break;
            case 'half_hour': // 30 minutes
                truncUnit = 'minute'; binSize = 30;
                break;
            case 'hour':
                truncUnit = 'hour'; break;
            case '12_hours':
                truncUnit = 'hour'; binSize = 12;
                break;
            case 'day':
                truncUnit = 'day'; break;
            case '3_days':
                truncUnit = 'day'; binSize = 3;
                break;
            case 'month':
                truncUnit = 'month'; break;
            case '4_months':
                truncUnit = 'month'; binSize = 4;
                break;
            case 'week':
                truncUnit = 'week'; break; // $dateTrunc supports 'week' directly
            default:
                error(400, `Неверный или неподдерживаемый интервал "${interval}".`);
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
                // Use $dateTrunc directly with binSize for all intervals
                $group: {
                    _id: { $dateTrunc: { date: "$timestamp", unit: truncUnit, binSize: binSize } },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ];

        const result = await collection.aggregate(pipeline).toArray();

        // MongoDB returns date as a Date object, convert to ISO string for the response
        return new Response(JSON.stringify(result.map(item => ({ time: item._id.toISOString(), count: item.count }))), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        console.error("Error fetching time series clicks:", err);
        error(500, 'Internal Server Error'); // Use SvelteKit's error utility
    }
}