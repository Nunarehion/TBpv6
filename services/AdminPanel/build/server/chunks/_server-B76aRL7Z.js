import { j as json } from './index-VRy5eTKY.js';
import { g as getMongoCollection } from './mongoService-aPNwwyA1.js';
import 'mongoose';

async function GET({ params }) {
  const { collectionName } = params;
  try {
    const collection = getMongoCollection(collectionName);
    const documents = await collection.find({}).sort({ _id: -1 }).toArray();
    return json(documents);
  } catch (err) {
    console.error(`Error fetching documents from ${collectionName}:`, err);
    return json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
async function POST({ params, request }) {
  const { collectionName } = params;
  const newDocument = await request.json();
  try {
    const collection = getMongoCollection(collectionName);
    const result = await collection.insertOne({
      ...newDocument,
      created_at: /* @__PURE__ */ new Date()
    });
    return json({ success: true, insertedId: result.insertedId }, { status: 201 });
  } catch (err) {
    console.error(`Error inserting document into ${collectionName}:`, err);
    return json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export { GET, POST };
//# sourceMappingURL=_server-B76aRL7Z.js.map
