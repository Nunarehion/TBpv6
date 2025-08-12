<script>
    import { onMount } from 'svelte';
    import DocumentPreview from '$lib/components/DocumentPreview.svelte';
    import { createDataManager } from '$lib/utils/data-manager.js';

    export let data;

    const collectionName = 'message';
    const apiFunctions = data.createApiFunctions(collectionName);
    const dataManager = createDataManager(apiFunctions);

    const { documents, loadingDocuments, apiError, fetchData, handleSave, handleAdd, handleDelete } = dataManager;

    onMount(() => {
        fetchData();
    });
</script>

<h1>Сообщения</h1>

{#if $apiError}
    <p style="color: red">Ошибка API: {$apiError}</p>
{/if}

<DocumentPreview
    documents={$documents}
    loading={$loadingDocuments}
    selectedCollection={collectionName}
    isMessageRoute={true}
    displayFields={['name', '_id', 'text', 'keyboard_name', 'images']}
    orderFields={['name', 'text', 'keyboard_name', 'images', 'created_at', '_id']}
    on:save={(e) => handleSave(e.detail).then(() => fetchData())}
    on:add={(e) => handleAdd(e.detail).then(() => fetchData())}
    on:delete={(e) => handleDelete(e.detail).then(() => fetchData())}
/>