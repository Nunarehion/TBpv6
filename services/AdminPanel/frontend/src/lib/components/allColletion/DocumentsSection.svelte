<script>
    import DocumentCard from './DocumentCard.svelte';
    import { createEventDispatcher } from 'svelte';

    export let documents = [];
    export let loading = false;
    export let selectedCollection;

    const dispatch = createEventDispatcher();

    function handleSave(doc) {
        dispatch('save', doc);
    }
</script>

{#if selectedCollection}
    <h1>Документы из коллекции: {selectedCollection}</h1>

    {#if loading}
        <p>Загрузка документов...</p>
    {:else if documents.length === 0}
        <p>Документы отсутствуют</p>
    {:else}
        <div class="document-grid">
            {#each documents as doc (doc._id)}
                <DocumentCard {doc} on:save={(e) => dispatch('save', e.detail)} />
            {/each}
        </div>
    {/if}
{/if}

<style>
    h1 {
        color: var(--main-text);
        margin-bottom: 1.5rem;
        font-size: 1.75rem;
    }

    p {
        color: var(--gray-text);
    }

    .document-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1rem;
    }

    @media (max-width: 768px) {
        .document-grid {
            grid-template-columns: 1fr;
        }
    }
</style>