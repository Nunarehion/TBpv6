<script>
    import DocumentPreview from '$lib/components/DocumentPreview.svelte';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    const collectionName = 'buttons';

    const documents = writable([]);
    const loadingDocuments = writable(false);
    const apiError = writable(null);

    async function loadAllDocuments() {
        loadingDocuments.set(true);
        apiError.set(null);
        try {
            const response = await fetch(`/api/${collectionName}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch documents');
            }
            const data = await response.json();
            documents.set(data);
        } catch (error) {
            apiError.set(error.message);
            documents.set([]);
        } finally {
            loadingDocuments.set(false);
        }
    }

    async function handleSave(doc) {
        apiError.set(null);
        try {
            const url = `/api/${collectionName}/${doc._id}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(doc)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save document');
            }
            await loadAllDocuments();
        } catch (error) {
            apiError.set(error.message);
        }
    }

    // Эта функция теперь принимает объект документа из модального окна
    async function handleAdd(event) {
        const newDoc = event.detail; // Получаем заполненные данные из события
        apiError.set(null);
        try {
            const url = `/api/${collectionName}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newDoc)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add document');
            }
            await loadAllDocuments();
        } catch (error) {
            apiError.set(error.message);
        }
    }

    async function handleDelete(doc) {
        apiError.set(null);
        try {
            const url = `/api/${collectionName}/${doc._id}`;
            const response = await fetch(url, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete document');
            }
            await loadAllDocuments();
        } catch (error) {
            apiError.set(error.message);
        }
    }

    onMount(() => {
        loadAllDocuments();
    });
</script>

<h1>Кнопки</h1>

{#if $apiError}
    <p style="color: red">Ошибка API: {$apiError}</p>
{/if}

<DocumentPreview
    documents={$documents}
    loading={$loadingDocuments}
    selectedCollection={collectionName}
    displayFields={['_id', 'text', 'callback_data', 'created_at']}
    orderFields={['_id', 'text', 'callback_data', 'created_at']}
    on:save={(e) => handleSave(e.detail)}
    on:add={handleAdd}
    on:delete={(e) => handleDelete(e.detail)}
/>
