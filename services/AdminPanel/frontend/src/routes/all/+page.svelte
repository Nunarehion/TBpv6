<script>
    import CollectionList from '$lib/components/allColletion/CollectionList.svelte';
    import DocumentsSection from '$lib/components/allColletion/DocumentsSection.svelte';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    export let data;

    const selectedCollection = writable(null);
    const documents = writable([]);
    const loadingDocuments = writable(false);
    const fetchError = writable(null);

    async function loadDocumentsForCollection(collectionName) {
        selectedCollection.set(collectionName);
        loadingDocuments.set(true);
        fetchError.set(null);

        try {
            const res = await fetch(`/api/${collectionName}`);
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || `HTTP error! Status: ${res.status}`);
            }
            const fetchedDocuments = await res.json();
            documents.set(fetchedDocuments);
        } catch (e) {
            console.error(`Error loading documents for ${collectionName}:`, e);
            fetchError.set(e.message);
            documents.set([]);
        } finally {
            loadingDocuments.set(false);
        }
    }

    async function saveDocument(collectionName, documentData) {
        console.log(`Saving document in ${collectionName}:`, documentData);
    }

    onMount(() => {
        if (data.collections.length > 0) {
            loadDocumentsForCollection(data.collections[0]);
        }
    });
</script>

<h1>Список коллекций из MongoDB</h1>

{#if $fetchError}
    <p style="color: red">Ошибка загрузки документов: {$fetchError}</p>
{:else if data.collections.length === 0}
    <p>Загрузка коллекций...</p>
{:else}
    <div class="wrap">
        <CollectionList
            collections={data.collections}
            selected={$selectedCollection}
            loadingDocuments={$loadingDocuments}
            on:select={(e) => loadDocumentsForCollection(e.detail)}
        />
    </div>
    {#if $selectedCollection}
        <DocumentsSection
            documents={$documents}
            loading={$loadingDocuments}
            selectedCollection={$selectedCollection}
            on:save={(e) => saveDocument($selectedCollection, e.detail)}
        />
    {/if}
{/if}

<style>

</style>