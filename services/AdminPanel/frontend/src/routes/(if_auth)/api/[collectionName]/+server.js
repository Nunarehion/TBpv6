import { json } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
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

export async function PUT({ params, request }) {
    const { collectionName } = params;
    const updatedDocument = await request.json();

    try {
        const collection = getMongoCollection(collectionName);
        const docId = updatedDocument._id;
        delete updatedDocument._id;

        const result = await collection.updateOne(
            { _id: new ObjectId(docId) },
            { $set: updatedDocument }
        );

        if (result.matchedCount === 0) {
            return json({ error: 'Document not found' }, { status: 404 });
        }

        return json({ success: true, modifiedCount: result.modifiedCount });
    } catch (err) {
        console.error(`Error updating document in ${collectionName}:`, err);
        return json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE({ params, request }) {
    const { collectionName } = params;
    const { id } = params;
    
    try {
        const collection = getMongoCollection(collectionName);
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return json({ error: 'Document not found' }, { status: 404 });
        }

        return json({ success: true, deletedCount: result.deletedCount });
    } catch (err) {
        console.error(`Error deleting document from ${collectionName}:`, err);
        return json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}
