import { error } from '@sveltejs/kit';

export const load = ({ fetch }) => {

    const createApiFunctions = (collectionName) => {
        const loadAllDocuments = async () => {
            try {
                const response = await fetch(`/api/${collectionName}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch documents');
                }
                return await response.json();
            } catch (err) {
                console.error(err);
                throw error(500, err.message);
            }
        };

        const handleSave = async (doc) => {
            try {
                const url = `/api/${collectionName}/${doc._id}`;
                const response = await fetch(url, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(doc)
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to save document');
                }
                return true;
            } catch (err) {
                console.error(err);
                throw error(500, err.message);
            }
        };

        const handleAdd = async (doc) => {
            try {
                const url = `/api/${collectionName}`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(doc)
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to add document');
                }
                return true;
            } catch (err) {
                console.error(err);
                throw error(500, err.message);
            }
        };

        const handleDelete = async (doc) => {
            try {
                const url = `/api/${collectionName}/${doc._id}`;
                const response = await fetch(url, { method: 'DELETE' });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to delete document');
                }
                return true;
            } catch (err) {
                console.error(err);
                throw error(500, err.message);
            }
        };

        return {
            loadAllDocuments,
            handleSave,
            handleAdd,
            handleDelete
        };
    };

    return {
        createApiFunctions
    };
};