<script>
    import DocumentRow from './DocumentRow.svelte';
    import { createEventDispatcher } from 'svelte';

    let { documents, orderedFields } = $props();

    const dispatch = createEventDispatcher();

    let editingId = $state(null);
    let sortKey = $state(null);
    let sortAsc = $state(true);
    let searchQuery = $state('');

    function getColumns(docs, fields) {
        if (docs.length === 0) return [];
        if (fields.length > 0) {
            const allKeys = Array.from(new Set(docs.flatMap((doc) => Object.keys(doc))));
            const presentPriority = fields.filter((key) => allKeys.includes(key));
            const restKeys = allKeys.filter((key) => !presentPriority.includes(key));
            return [...presentPriority, ...restKeys];
        }
        return Array.from(new Set(docs.flatMap((doc) => Object.keys(doc))));
    }

    let columns = $derived.by(() => getColumns(documents, orderedFields));

    function sortDocuments(docs) {
        if (!sortKey) return docs;

        return [...docs].sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];

            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return 1;
            if (bVal == null) return -1;

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortAsc ? aVal - bVal : bVal - aVal;
            }

            return sortAsc
                ? String(aVal).localeCompare(String(bVal), 'ru', { sensitivity: 'base' })
                : String(bVal).localeCompare(String(aVal), 'ru', { sensitivity: 'base' });
        });
    }

    function filterDocuments(docs, cols, query) {
        if (!query) return docs;
        const q = query.toLowerCase();
        return docs.filter((doc) =>
            cols.some((col) => {
                const val = doc[col];
                return val != null && String(val).toLowerCase().includes(q);
            })
        );
    }

    let displayedDocuments = $derived.by(() => {
        const filtered = filterDocuments(documents, columns, searchQuery);
        return sortDocuments(filtered);
    });

    function onStartEdit(event) {
        editingId = event.detail._id;
    }

    function onCancelEdit() {
        editingId = null;
    }

    function onSave(event) {
        dispatch('save', event.detail);
        editingId = null;
    }

    function onDelete(event) {
        dispatch('delete', event.detail);
    }

    function onAddClick() {
        dispatch('add');
    }

    function onHeaderClick(col) {
        if (sortKey === col) {
            sortAsc = !sortAsc;
        } else {
            sortKey = col;
            sortAsc = true;
        }
    }
</script>

{#if documents.length === 0}
    <p>Документы отсутствуют</p>
{:else}
    <div class="table-container">
        <div class="tools-panel">
            <input type="text" placeholder="Поиск..." bind:value={searchQuery} class="search-input" />
        </div>

        <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th class="id-column-header"></th>
                        {#each columns as col}
                            <th on:click={() => onHeaderClick(col)}>
                                {col}
                                <span class="sort-icon" style="opacity: {sortKey === col ? 1 : 0.2};">
                                    {sortKey == col ? (sortAsc ? '▲' : '▼') : '▲'}
                                </span>
                            </th>
                        {/each}
                        <th class="actions-column-header">Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {#each displayedDocuments as doc (doc._id)}
                        <DocumentRow
                            {doc}
                            {columns}
                            {editingId}
                            on:startEdit={onStartEdit}
                            on:cancelEdit={onCancelEdit}
                            on:save={onSave}
                            on:delete={onDelete}
                        />
                    {/each}
                </tbody>
            </table>
        </div>

        <div class="create-button-wrap">
            <button class="create-button" on:click={onAddClick}>➕ Добавить</button>
        </div>
    </div>
{/if}

<style>

    .table-container {
        background: var(--first-color);
        display: flex;
        flex-direction: column;
        height: 600px;
        border-radius: 1rem 1rem 0 0;
        box-shadow: 0 0 2px #00000022;
        border: 1px solid var(--border-gray);
        overflow: hidden;
    }

    .tools-panel {
        padding: 1rem;
        background: var(--first-color);
        border-bottom: 1px solid var(--border-gray);
    }

    .search-input {
        padding: 0.5rem;
        font-size: 1rem;
        width: 300px;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
    }

    .table-wrapper {
        flex: 1;
        overflow: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .table-wrapper::-webkit-scrollbar {
        display: none;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
    }

    thead {
        top: 0;
        z-index: 10;
        background: var(--second-color);
    }

    th {
        font-weight: bold;
        border-bottom: 2px solid var(--action-button-color);
        color: var(--gray-text);
        padding: 1rem;
        cursor: pointer;
        user-select: none;
        text-align: left;

    }

    th.id-column-header {
        width: 40px;
        min-width: 40px;
        max-width: 40px;
    }

    th.actions-column-header {
        width: 150px;
        min-width: 150px;
        max-width: 150px;
    }

    .sort-icon {
        margin-left: 0.5rem;
        transition: opacity 0.2s ease-in-out;
    }

    tbody {
        background: var(--first-color);
    }

    .create-button-wrap {
        padding: 1rem;
        background: var(--first-color);
        border-top: 1px solid var(--border-gray);
        text-align: right;
    }

    .create-button {
        padding: 0.5rem 1.2rem;
        background-color: var(--action-button-color);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.2s ease-in-out;
    }

    .create-button:hover {
        background-color: var(--action-button-hover-color);
    }
</style>
