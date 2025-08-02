import { j as json } from './index-VRy5eTKY.js';
import mongoose from 'mongoose';

async function GET() {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);
    return json(collectionNames);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

export { GET };
//# sourceMappingURL=_server-DI4z0Hp6.js.map
