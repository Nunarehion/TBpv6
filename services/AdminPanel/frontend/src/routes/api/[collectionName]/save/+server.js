import { json, error } from '@sveltejs/kit';
import { getMongoCollection } from '$lib/server/mongoService';
import { ObjectId } from 'mongodb';

export async function POST({ params, request }) {
    const { collectionName } = params;
    const documentData = await request.json();

    try {
        const collection = getMongoCollection(collectionName);
        let result;

        if (documentData._id) {
            const { _id, ...updateData } = documentData;
            if (!ObjectId.isValid(_id)) {
                throw error(400, 'Invalid document ID format');
            }
            result = await collection.updateOne(
                { _id: new ObjectId(_id) },
                { $set: updateData }
            );

            if (result.matchedCount === 0) {
                return json({ message: 'Документ не найден', document: null });
            }

            return json({ message: 'Документ успешно обновлен', modifiedCount: result.modifiedCount });
        } else {
            result = await collection.insertOne(documentData);
            return json({ message: 'Документ успешно создан', documentId: result.insertedId });
        }

    } catch (err) {
        throw error(500, err.message || 'Внутренняя ошибка сервера при сохранении документа');
    }
}