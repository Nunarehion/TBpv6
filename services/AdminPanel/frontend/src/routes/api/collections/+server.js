import { json } from '@sveltejs/kit';
import mongoose from '$lib/server/mongoService'; 

export async function GET() {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        return json(collectionNames);
    } catch (error) {
        console.error('Error fetching collections:', error);
        return json({ error: 'Failed to fetch collections' }, { status: 500 });
    }
}