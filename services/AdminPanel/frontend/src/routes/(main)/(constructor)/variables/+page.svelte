<script>
    import { onMount } from 'svelte';
    import DocumentPreview from '$lib/components/DocumentPreview.svelte';
    import { createDataManager } from '$lib/utils/data-manager.js';

    export let data;

    const collectionName = 'variables';
    const apiFunctions = data.createApiFunctions(collectionName);
    const dataManager = createDataManager(apiFunctions);

    const { documents, loadingDocuments, apiError, fetchData, handleSave, handleAdd, handleDelete } = dataManager;

    onMount(() => {
        fetchData();
    });
</script>

<h1>Переменные</h1>

{#if $apiError}
    <p style="color: red">Ошибка API: {$apiError}</p>
{/if}

<DocumentPreview
    documents={$documents}
    loading={$loadingDocuments}
    displayFields={['_id','name', 'value', 'description']}
    selectedCollection={collectionName}
    orderFields={['_id', 'name', 'value', 'description']}
    on:save={(e) => handleSave(e.detail).then(() => fetchData())}
    on:add={(e) => handleAdd(e.detail).then(() => fetchData())}
    on:delete={(e) => handleDelete(e.detail).then(() => fetchData())}
/>