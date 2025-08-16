import { json, error } from '@sveltejs/kit';
import { getMongoCollection } from '$lib/server/mongoService';
import { ObjectId } from 'mongodb';

export async function PUT({ params, request }) {
    const { collectionName, id } = params;
    let updateData = await request.json();

    if (!ObjectId.isValid(id)) {
        throw error(400, 'Invalid document ID format');
    }

    delete updateData._id; 

    try {
        const collection = getMongoCollection(collectionName);
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            throw error(404, 'Document not found');
        }

        return json({ success: true, modifiedCount: result.modifiedCount });
    } catch (err) {
        if (err.code === 66) {
             throw error(400, "Cannot modify immutable fields like '_id'.");
        }
        throw error(500, err.message || 'Internal server error during update');
    }
}

export async function DELETE({ params }) {
    const { collectionName, id } = params;

    if (!ObjectId.isValid(id)) {
        throw error(400, 'Invalid document ID format');
    }

    try {
        const collection = getMongoCollection(collectionName);
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            throw error(404, 'Document not found');
        }

        return json({ success: true });
    } catch (err) {
        throw error(500, err.message || 'Internal server error during delete');
    }
}

export async function GET({ params }) {
    const { collectionName, id } = params;

    if (!ObjectId.isValid(id)) {
        throw error(400, 'Invalid document ID format');
    }

    try {
        const collection = getMongoCollection(collectionName);
        const document = await collection.findOne({ _id: new ObjectId(id) });

        if (!document) {
            throw error(404, 'Document not found');
        }

        return json(document);
    } catch (err) {
        throw error(500, err.message || 'Internal server error during fetch single document');
    }
}