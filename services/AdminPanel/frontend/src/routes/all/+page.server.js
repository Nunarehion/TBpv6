import mongoose from '$lib/server/mongoService';

export async function post({ params, request }) {
    const collectionName = params.collectionName;
    const documentData = await request.json();

    try {
        const collection = mongoose.connection.db.collection(collectionName);
        const result = await collection.insertOne(documentData);
        return {
            status: 200,
            body: { message: 'Документ успешно сохранен!', id: result.insertedId },
        };
    } catch (error) {
        console.error('Ошибка при сохранении документа:', error);
        return {
            status: 500,
            body: { error: 'Ошибка при сохранении документа.' },
        };
    }
}
