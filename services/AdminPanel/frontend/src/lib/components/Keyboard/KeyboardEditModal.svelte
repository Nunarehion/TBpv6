<script>
    import { createEventDispatcher } from 'svelte';
    import { slide } from 'svelte/transition';
    import KeyboardGrid from './KeyboardGrid.svelte';
    import ButtonManager from './ButtonManager.svelte';

    let { doc, columns = [] } = $props();

    const dispatch = createEventDispatcher();

    // Функция для генерации короткого уникального ID
    function generateShortId() {
        return Math.random().toString(36).substring(2, 9);
    }

    // Создаем `editableDoc` с автоматическим заполнением имени, если оно отсутствует.
    // Если doc.name не существует, генерируем уникальный ID.
    let editableDoc = $state({
        ...doc,
        name: doc.name || `keyboard_${generateShortId()}`,
        buttons:
            doc.buttons && Array.isArray(doc.buttons)
                ? doc.buttons.map((row) => (Array.isArray(row) ? row.map((btn) => ({ id: btn.id })) : []))
                : []
    });

    let availableButtons = $state([]);
    let loadingAvailableButtons = $state(true);
    let errorAvailableButtons = $state(null);

    function handleInput(field, event) {
        editableDoc = { ...editableDoc, [field]: event.target.value };
    }

    function handleButtonsUpdate(newButtons) {
        editableDoc.buttons = newButtons;
    }

    function handleAddButton(event) {
        const button = event.detail;
        if (button) {
            const newRow = [button];
            editableDoc.buttons = [...editableDoc.buttons, newRow];
        }
    }

    function save() {
        const buttonsToSave = editableDoc.buttons.map((row) =>
            row.map((button) => ({ id: button.id }))
        );
        dispatch('save', { ...editableDoc, buttons: buttonsToSave });
    }

    function cancel() {
        dispatch('cancel');
    }
</script>

<div class="modal-overlay" transition:slide>
    <div class="modal-content">
        <h2>Редактировать клавиатуру</h2>
        <form on:submit|preventDefault={save}>
            {#each columns as col}
                {#if col !== '_id' && col !== 'buttons'}
                    <div class="form-group">
                        <label for={col}>{col.replace(/_/g, ' ')}:</label>
                        <input
                            type="text"
                            id={col}
                            bind:value={editableDoc[col]}
                            on:input={(e) => handleInput(col, e)}
                        />
                    </div>
                {/if}
            {/each}

            <KeyboardGrid bind:buttons={editableDoc.buttons} bind:availableButtons on:updateButtons={handleButtonsUpdate} />

            <ButtonManager bind:availableButtons bind:loadingAvailableButtons bind:errorAvailableButtons on:addButton={handleAddButton} />

            <div class="modal-actions">
                <button type="submit" class="action-button save-button">Сохранить</button>
                <button type="button" on:click={cancel} class="action-button cancel-button">Отмена</button>
            </div>
        </form>
    </div>
</div>

<style>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        touch-action: none;
    }
    .modal-content {
        background-color: var(--first-color);
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        width: 90%;
        max-width: 800px;
        color: var(--main-text);
        border: 1px solid var(--border-gray);
        overflow-y: auto;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
    }
    h2 {
        color: var(--blue);
        margin-top: 0;
        margin-bottom: 1.5rem;
        text-align: center;
    }
    .form-group {
        margin-bottom: 1rem;
    }
    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: bold;
        color: var(--gray-text);
    }
    .form-group input {
        width: calc(100% - 20px);
        padding: 0.8rem 10px;
        border: 1px solid var(--border-gray);
        border-radius: 5px;
        background-color: var(--second-color);
        color: var(--main-text);
        font-size: 1rem;
    }
    .form-group input:focus {
        outline: none;
        border-color: var(--blue);
        box-shadow: 0 0 0 2px rgba(var(--blue-rgb), 0.2);
    }
    .modal-actions {
        margin-top: 2rem;
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
    }
    .action-button {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.2s ease;
    }
    .save-button {
        background-color: var(--action-button-color);
        color: white;
    }
    .save-button:hover {
        background-color: var(--action-button-hover-color);
    }
    .cancel-button {
        background-color: var(--second-color);
        color: var(--main-text);
        border: 1px solid var(--border-gray);
    }
    .cancel-button:hover {
        background-color: var(--hover-color);
    }
</style>