<script>
    import { onMount } from 'svelte';
    import DocumentPreview from '$lib/components/DocumentPreview.svelte';
    import { createDataManager } from '$lib/utils/data-manager.js';

    export let data;
    const collectionName = 'handlers';
    const apiFunctions = data.createApiFunctions(collectionName);
    const dataManager = createDataManager(apiFunctions);

    const { documents, loadingDocuments, apiError, fetchData, handleSave, handleAdd, handleDelete } = dataManager;

    onMount(() => {
        fetchData();
    });
</script>

<h1>Тригеры</h1>

{#if $apiError}
    <p style="color: red">Ошибка API: {$apiError}</p>
{/if}

<DocumentPreview
    documents={$documents}
    loading={$loadingDocuments}
    selectedCollection={collectionName}
    displayFields={['pattern', 'message_name']}
    orderFields={['pattern', 'message_name', 'created_at']}
    on:save={(e) => handleSave(e.detail).then(() => fetchData())}
    on:add={(e) => handleAdd(e.detail).then(() => fetchData())}
    on:delete={(e) => handleDelete(e.detail).then(() => fetchData())}
/>