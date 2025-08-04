import { error } from '@sveltejs/kit';
import mongoose from '$lib/server/mongoService';

export async function load({ fetch }) {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        return {
            collections: collectionNames,
        };
    } catch (e) {
        console.error('Error in +page.server.js load function:', e);
        throw error(500, 'Failed to load collections. Internal server error.');
    }
}
