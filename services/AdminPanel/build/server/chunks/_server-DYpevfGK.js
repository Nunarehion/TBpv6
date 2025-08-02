import { j as json } from './index-VRy5eTKY.js';
import { c as connectMongoDB, g as getMongoCollection } from './mongoService-aPNwwyA1.js';
import 'mongoose';

async function GET({ url }) {
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  if (!startDate || !endDate) {
    return json({ error: "Требуются параметры startDate и endDate." }, { status: 400 });
  }
  try {
    await connectMongoDB();
    const collection = getMongoCollection("interactions");
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return json({ error: "Неверный формат даты. Используйте ISO 8601." }, { status: 400 });
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
          _id: "$user_id"
        }
      },
      {
        $count: "totalUsers"
      }
    ];
    const result = await collection.aggregate(pipeline).toArray();
    const totalUsers = result.length > 0 ? result[0].totalUsers : 0;
    return json({ count: totalUsers, startDate: startDateTime, endDate: endDateTime });
  } catch (err) {
    console.error("Error fetching total users:", err);
    return json({ error: err.message || "Внутренняя ошибка сервера." }, { status: 500 });
  }
}

export { GET };
//# sourceMappingURL=_server-DYpevfGK.js.map
