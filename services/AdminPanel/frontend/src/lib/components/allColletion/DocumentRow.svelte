<script>
    import { createEventDispatcher } from 'svelte';
    import DocumentEditModal from './DocumentEditModal.svelte';
    import MessageEditModal from './MessageEditModal.svelte';
    import KeyboardEditModal from './KeyboardEditModal.svelte';

    import HandlerEditModal from './HandlerEditModal.svelte';
    import Checkbox from '../allColletion/Checkbox.svelte';

    let {
        doc,
        columns = [],
        editingId = null,
        isMessageRoute = false,
        selectedCollection
    } = $props();
    const dispatch = createEventDispatcher();

    let showDeleteConfirm = $state(false);
    let showEditModal = $state(false);

    let isEditing = $derived(doc && editingId === doc._id);

    function confirmDelete() {
        showDeleteConfirm = true;
    }

    function cancelDelete() {
        showDeleteConfirm = false;
    }

    function executeDelete() {
        dispatch('delete', doc);
        showDeleteConfirm = false;
    }

    function startEdit() {
        showEditModal = true;
    }

    function onModalSave(event) {
        dispatch('save', event.detail);
        editingId = null;
        showEditModal = false;
    }

    function onModalCancel() {
        editingId = null;
        showEditModal = false;
    }
</script>

{#if doc}
    <tr class="table-row">
        <td class="table-cell select-cell">
            <Checkbox disabled={isEditing} />
        </td>
        {#each columns as col}
            <td
                class="table-cell"
                class:name-text={col.trim() === 'name'}
                title={doc[col] ?? ''}
                data-label={col}
            >
                {#if col.trim() === 'text'}
                    <span>
                        {doc[col]?.length > 15 ? doc[col].slice(0, 15) + '…' : (doc[col] ?? '-')}
                    </span>
                {:else if col === '_id'}
                    {typeof doc[col] === 'string' ? '…' + doc[col].slice(-5) : doc[col]}
                {:else if col === 'buttons'}
                    {#if Array.isArray(doc[col]) && doc[col].length > 0}
                        {`buttons (${doc[col].flatMap((row) => (Array.isArray(row) ? row.length : 0)).reduce((sum, count) => sum + count, 0)})`}
                    {:else}
                        -
                    {/if}
                {:else if col === 'images'}
                    {Array.isArray(doc[col]) && doc[col].length > 0 ? `${doc[col].length} image(s)` : '-'}
                {:else if col === 'created_at'}
                    {doc[col] ? new Date(doc[col]).toLocaleDateString('ru-RU') : '-'}
                {:else}
                    {doc[col] ?? '-'}
                {/if}
            </td>
        {/each}
        <td class="table-cell actions-cell" data-label="Действия">
            <button on:click={startEdit} aria-label="Редактировать" class="action-button edit-button">
                <svg class="icon"><use href="/sprite.svg#pen"></use></svg>
            </button>
            <button on:click={confirmDelete} aria-label="Удалить" class="action-button delete-button">
                <svg class="icon"><use href="/sprite.svg#trash-bin"></use></svg>
            </button>
        </td>
    </tr>

    {#if showDeleteConfirm}
        <div class="modal-overlay">
            <div class="modal-content">
                <h3>Подтверждение удаления</h3>
                <p>Вы уверены, что хотите удалить этот документ?</p>
                <div class="modal-actions">
                    <button on:click={executeDelete} class="action-button modal-delete-button">Удалить</button>
                    <button on:click={cancelDelete} class="action-button modal-cancel-button">Отмена</button>
                </div>
            </div>
        </div>
    {/if}

    {#if showEditModal}
        {#if isMessageRoute}
            <MessageEditModal {doc} {columns} on:save={onModalSave} on:cancel={onModalCancel} />
        {:else if selectedCollection === 'keyboards'}
            <KeyboardEditModal {doc} {columns} on:save={onModalSave} on:cancel={onModalCancel} />
        {:else if selectedCollection === 'handlers'}
            <HandlerEditModal {doc} {columns} on:save={onModalSave} on:cancel={onModalCancel} />
        {:else}
            <DocumentEditModal {doc} {columns} on:save={onModalSave} on:cancel={onModalCancel} />
        {/if}
    {/if}
{/if}

<style>
    .table-row {
        border-bottom: 1px solid var(--border-gray);
        background-color: var(--first-color);
    }

    .table-row:hover {
        background-color: var(--hover-color);
    }

    .table-cell {
        padding: 0.8rem 1rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--main-text);
        vertical-align: middle;
    }

    .select-cell {
        width: 40px;
        text-align: center;
    }

    .actions-cell {
        width: auto;
        text-align: right;
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        align-items: center;
        padding-right: 1rem;
    }

    .action-button {
        padding: 0.4rem 0.8rem;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.85rem;
        transition:
            background-color 0.2s ease,
            color 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;
    }

    .edit-button {
        color: var(--decor-green);
    }

    .edit-button:hover {
        background-color: rgba(40, 167, 69, 0.1);
    }

    .delete-button {
        color: var(--decor-red);
    }

    .delete-button:hover {
        background-color: rgba(226, 57, 57, 0.1);
    }

    .icon {
        width: 1.2rem;
        height: 1.2rem;
        fill: currentColor;
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background-color: var(--first-color);
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        text-align: center;
        color: var(--main-text);
        border: 1px solid var(--border-gray);
    }

    .modal-actions {
        margin-top: 1.5rem;
        display: flex;
        justify-content: center;
        gap: 1rem;
    }

    .modal-delete-button {
        background-color: var(--decor-red);
        color: var(--main-text);
        padding: 0.6rem 1.2rem;
        border-radius: 5px;
        cursor: pointer;
        border: none;
        transition: background-color 0.2s ease;
    }

    .modal-delete-button:hover {
        background-color: #c82333;
    }

    .modal-cancel-button {
        background-color: var(--second-color);
        color: var(--main-text);
        padding: 0.6rem 1.2rem;
        border-radius: 5px;
        cursor: pointer;
        border: none;
        transition: background-color 0.2s ease;
    }

    .modal-cancel-button:hover {
        background-color: #4b5563;
    }

    @media (max-width: 768px) {
        .table-row {
            display: block;
            margin-bottom: 1rem;
            border-bottom: 2px solid var(--action-button-color);
            border-radius: 8px;
            padding: 1rem;
        }

        .table-cell {
            display: block;
            width: 100%;
            text-align: left;
            padding: 0.5rem 0;
            white-space: normal;
            overflow: visible;
            text-overflow: clip;
            border-bottom: 1px solid var(--border-gray);
        }

        .table-cell:last-of-type {
            border-bottom: none;
        }

        .table-cell::before {
            content: attr(data-label);
            font-weight: bold;
            display: inline-block;
            width: 120px;
            color: var(--gray-text);
        }
        
        .actions-cell {
            padding: 1rem 0 0 0;
            justify-content: flex-start;
            border-bottom: none;
        }
    }
</style>
