<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import CollectionList from '$lib/components/allColletion/CollectionList.svelte';
    import DocumentsSection from '$lib/components/allColletion/DocumentsSection.svelte';
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
            const encodedCollectionName = encodeURIComponent(collectionName);
            const res = await fetch(`/api/${encodedCollectionName}`);
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
        try {
            const response = await fetch(`/api/${encodeURIComponent(collectionName)}/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(documentData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            alert(result.message || 'Документ успешно сохранен!');
        } catch (error) {
            console.error('Ошибка при сохранении документа:', error);
            alert('Ошибка при сохранении документа: ' + error.message);
        }
    }

    onMount(() => {
        if (data.collections.length > 0) {
            loadDocumentsForCollection(data.collections[0]);
        }
    });
</script>

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