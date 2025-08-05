import { writable } from 'svelte/store';

export function createDataManager(apiFunctions) {
    const documents = writable([]);
    const loadingDocuments = writable(false);
    const apiError = writable(null);

    const fetchData = async () => {
        loadingDocuments.set(true);
        apiError.set(null);
        try {
            const result = await apiFunctions.loadAllDocuments();
            documents.set(result);
        } catch (e) {
            apiError.set(e.message);
            documents.set([]);
        } finally {
            loadingDocuments.set(false);
        }
    };

    return {
        documents,
        loadingDocuments,
        apiError,
        fetchData,
        handleSave: apiFunctions.handleSave,
        handleAdd: apiFunctions.handleAdd,
        handleDelete: apiFunctions.handleDelete,
    };
}