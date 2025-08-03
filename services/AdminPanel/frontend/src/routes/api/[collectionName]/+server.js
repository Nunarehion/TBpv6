import { json } from '@sveltejs/kit';
import { getMongoCollection } from '$lib/server/mongoService';

export async function GET({ params }) {
    const { collectionName } = params;
    try {
        const collection = getMongoCollection(collectionName);
        const documents = await collection.find({}).toArray();
        return json(documents);
    } catch (err) {
        console.error(`Error fetching documents from ${collectionName}:`, err);
        return json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}

export async function POST({ params, request }) {
    const { collectionName } = params;
    const newDocument = await request.json();

    try {
        const collection = getMongoCollection(collectionName);
        const result = await collection.insertOne({
            ...newDocument,
            created_at: new Date()
        });
        return json({ success: true, insertedId: result.insertedId }, { status: 201 });
    } catch (err) {
        console.error(`Error inserting document into ${collectionName}:`, err);
        return json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}
