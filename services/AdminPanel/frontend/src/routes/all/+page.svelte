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
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(documentData),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || `HTTP error! Status: ${response.status}`);
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

    let backupFile;

    async function exportBackup() {
        try {
            const res = await fetch('/api/backup');
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || `HTTP error! Status: ${res.status}`);
            }
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup_${new Date().toISOString()}.gz`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            alert('Резервная копия успешно экспортирована!');
        } catch (e) {
            alert('Ошибка при экспорте резервной копии: ' + e.message);
        }
    }

    async function importBackup() {
        if (!backupFile || backupFile.length === 0) {
            alert('Пожалуйста, выберите файл резервной копии.');
            return;
        }

        const formData = new FormData();
        formData.append('backupFile', backupFile[0]);

        try {
            const res = await fetch('/api/backup', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || `HTTP error! Status: ${res.status}`);
            }

            const result = await res.json();
            alert(result.message);
        } catch (e) {
            console.error('Ошибка импорта:', e);
            alert('Ошибка при импорте резервной копии: ' + e.message);
        }
    }
</script>


<h1>Список коллекций из MongoDB</h1>

<div class="backup-controls">
    <h3>Управление базой данных</h3>
    <p>Создать полную резервную копию базы данных.</p>
    <button on:click={exportBackup}>Экспортировать резервную копию</button>
    <hr />
    <p>Загрузить файл для восстановления базы данных.</p>
    <form on:submit|preventDefault={importBackup}>
        <input type="file" bind:files={backupFile} accept=".gz" required />
        <button type="submit">Импортировать резервную копию</button>
    </form>
</div>

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
    .backup-controls {
        margin-top: 2rem;
        padding: 2rem;
        background-color: var(--first-color);
        border: 1px solid var(--border-gray);
        border-radius: 8px;
    }

    .backup-controls h3 {
        margin-bottom: 1rem;
    }

    .backup-controls p {
        margin-bottom: 0.5rem;
    }

    .backup-controls button {
        padding: 0.5rem 1rem;
        border-radius: 4px;
        background-color: #3b82f6;
        color: white;
        border: none;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .backup-controls button:hover {
        background-color: #2563eb;
    }

    .backup-controls form {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-top: 1rem;
    }

    .backup-controls hr {
        margin: 1.5rem 0;
        border-color: var(--border-gray);
    }
</style>

