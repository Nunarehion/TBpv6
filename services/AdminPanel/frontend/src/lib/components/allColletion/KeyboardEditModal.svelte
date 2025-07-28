<script>
    import { createEventDispatcher } from 'svelte';
    import { slide } from 'svelte/transition';
    import { onMount } from 'svelte';

    let { doc, columns = [] } = $props();

    const dispatch = createEventDispatcher();

    // При инициализации editableDoc.buttons сохраняем только id кнопок
    let editableDoc = $state({
        ...doc,
        buttons:
            doc.buttons && Array.isArray(doc.buttons)
                ? doc.buttons.map((row) =>
                        Array.isArray(row)
                            ? row.map((btn) => ({ id: btn.id })) // Сохраняем только id
                            : []
                    )
                : []
    });

    let draggedButton = $state(null);
    let draggedButtonSourceRow = $state(null);
    let draggedButtonSourceIndex = $state(null);
    let draggedButtonIsNew = $state(false);

    let availableButtons = $state([]);
    let loadingAvailableButtons = $state(true);
    let errorAvailableButtons = $state(null);

    onMount(async () => {
        try {
            const response = await fetch('/api/buttons');
            if (!response.ok) {
                throw new Error(`Failed to fetch 'buttons' buttons: ${response.statusText}`);
            }
            const data = await response.json();

            // Сохраняем доступные кнопки с их id и текстом
            availableButtons = data.map((buttonDoc) => ({
                id: buttonDoc._id,
                text:
                    buttonDoc.text ||
                    buttonDoc.label ||
                    buttonDoc.name ||
                    `Кнопка ${String(buttonDoc._id).slice(-4)}`
            }));
        } catch (error) {
            console.error('Error loading available buttons:', error);
            errorAvailableButtons = error.message;
        } finally {
            loadingAvailableButtons = false;
        }
    });

    // Функция для получения текста кнопки по ID из availableButtons
    function getButtonText(buttonId) {
        const button = availableButtons.find(b => b.id === buttonId);
        return button ? button.text : 'Нет текста';
    }

    function handleInput(field, event) {
        editableDoc = { ...editableDoc, [field]: event.target.value };
    }

    function handleDragStart(event, button, rowIdx = -1, btnIdx = -1, isNew = false) {
        // При перетаскивании draggedButton может быть как полной кнопкой (из availableButtons),
        // так и просто объектом {id} (из конструктора).
        // Мы передаем весь объект button, чтобы сохранить его свойства для дальнейшей работы.
        draggedButton = button;
        draggedButtonSourceRow = rowIdx;
        draggedButtonSourceIndex = btnIdx;
        draggedButtonIsNew = isNew;
        event.dataTransfer.effectAllowed = 'move';
    }

    function handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    function handleDrop(event, targetRowIdx, targetBtnIdx = -1) {
        event.preventDefault();
        if (!draggedButton) return;

        let newButtons = JSON.parse(JSON.stringify(editableDoc.buttons));

        // Удаляем кнопку из исходного места, если она не новая
        if (!draggedButtonIsNew && draggedButtonSourceRow !== -1 && draggedButtonSourceIndex !== -1) {
            newButtons[draggedButtonSourceRow].splice(draggedButtonSourceIndex, 1);
            if (newButtons[draggedButtonSourceRow].length === 0) {
                newButtons.splice(draggedButtonSourceRow, 1);
            }
        }

        // Добавляем в объект только ID кнопки
        const buttonToAdd = { id: draggedButton.id };

        if (targetRowIdx === -1) {
            newButtons.push([buttonToAdd]);
        } else if (targetBtnIdx === -1) {
            if (!newButtons[targetRowIdx]) {
                newButtons[targetRowIdx] = [];
            }
            newButtons[targetRowIdx].push(buttonToAdd);
        } else {
            newButtons[targetRowIdx].splice(targetBtnIdx, 0, buttonToAdd);
        }

        editableDoc.buttons = newButtons;
        draggedButton = null;
        draggedButtonSourceRow = null;
        draggedButtonSourceIndex = null;
        draggedButtonIsNew = false;
    }

    function removeButton(rowIdx, btnIdx) {
        let newButtons = JSON.parse(JSON.stringify(editableDoc.buttons));
        newButtons[rowIdx].splice(btnIdx, 1);
        if (newButtons[rowIdx].length === 0) {
            newButtons.splice(rowIdx, 1);
        }
        editableDoc.buttons = newButtons;
    }

    function addNewRow() {
        editableDoc.buttons = [...editableDoc.buttons, []];
    }

    function deleteRow(rowIdx) {
        let newButtons = JSON.parse(JSON.stringify(editableDoc.buttons));
        newButtons.splice(rowIdx, 1);
        editableDoc.buttons = newButtons;
    }

    function save() {
        // При сохранении отправляем только ID кнопок
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

            <div class="form-group keyboard-builder-section">
                <label>Расположение кнопок:</label>
                <div class="keyboard-preview">
                    {#each editableDoc.buttons as row, rowIdx}
                        <div
                            class="button-row"
                            on:dragover={handleDragOver}
                            on:drop={(e) => handleDrop(e, rowIdx, -1)}
                        >
                            {#each row as button, btnIdx}
                                <div
                                    class="keyboard-button"
                                    draggable="true"
                                    on:dragstart={(e) => handleDragStart(e, button, rowIdx, btnIdx, false)}
                                    on:dragover={handleDragOver}
                                    on:drop={(e) => handleDrop(e, rowIdx, btnIdx)}
                                >
                                    <span>{getButtonText(button.id)}</span>
                                    <button
                                        type="button"
                                        class="remove-button"
                                        on:click={() => removeButton(rowIdx, btnIdx)}>&times;</button
                                    >
                                </div>
                            {/each}
                            {#if row.length === 0}
                                <div
                                    class="empty-drop-target"
                                    on:dragover={handleDragOver}
                                    on:drop={(e) => handleDrop(e, rowIdx, -1)}
                                >
                                    Перетащите кнопки сюда, чтобы добавить в эту строку
                                </div>
                            {/if}
                            {#if editableDoc.buttons.length > 1}
                                <button type="button" class="delete-row-button" on:click={() => deleteRow(rowIdx)}>
                                    Удалить строку
                                </button>
                            {/if}
                        </div>
                    {/each}
                    <button type="button" on:click={addNewRow} class="add-row-button"
                        >+ Добавить строку</button
                    >
                    {#if editableDoc.buttons.length === 0}
                        <div
                            class="empty-keyboard-drop-target"
                            on:dragover={handleDragOver}
                            on:drop={(e) => handleDrop(e, -1)}
                        >
                            Перетащите кнопки сюда, чтобы начать новую строку
                        </div>
                    {/if}
                </div>
            </div>

            <div class="form-group available-buttons-section">
                <label>Доступные кнопки:</label>
                {#if loadingAvailableButtons}
                    <p>Загрузка доступных кнопок...</p>
                {:else if errorAvailableButtons}
                    <p class="error-message">Ошибка загрузки кнопок: {errorAvailableButtons}</p>
                {:else if availableButtons.length > 0}
                    <div class="available-buttons-list">
                        {#each availableButtons as button (button.id)}
                            <div
                                class="available-button"
                                draggable="true"
                                on:dragstart={(e) => handleDragStart(e, button, -1, -1, true)}
                            >
                                {button.text || `Кнопка ${String(button.id).slice(-4)}`}
                            </div>
                        {/each}
                    </div>
                {:else}
                    <p>Кнопки в коллекции 'кнопко' не найдены. Добавьте их сначала!</p>
                {/if}
            </div>

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

    .keyboard-builder-section {
        border: 1px solid var(--border-gray);
        border-radius: 8px;
        padding: 1rem;
        margin-top: 1.5rem;
        background-color: var(--second-color);
    }

    .keyboard-preview {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        min-height: 100px;
        border: 1px dashed var(--gray-text);
        padding: 0.5rem;
        border-radius: 5px;
        background-color: var(--first-color);
    }

    .button-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        min-height: 40px;
        border-bottom: 1px dashed rgba(var(--gray-text-rgb), 0.3);
        padding-bottom: 0.5rem;
        align-items: center;
        position: relative;
    }

    .button-row:last-of-type {
        border-bottom: none;
        padding-bottom: 0;
    }

    .keyboard-button {
        background-color: var(--action-button-color);
        color: white;
        padding: 0.6rem 1rem;
        border-radius: 5px;
        cursor: grab;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        user-select: none;
        position: relative;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 150px;
    }
    .keyboard-button:active {
        cursor: grabbing;
    }

    .remove-button {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        transition: color 0.2s ease;
    }
    .remove-button:hover {
        color: var(--decor-red);
    }

    .add-row-button {
        background-color: var(--blue);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 0.5rem;
        align-self: flex-start;
    }

    .add-row-button:hover {
        background-color: var(--blue-dark);
    }

    .delete-row-button {
        background-color: var(--decor-red);
        color: white;
        border: none;
        padding: 0.4rem 0.8rem;
        border-radius: 5px;
        cursor: pointer;
        margin-left: auto;
        font-size: 0.85rem;
    }
    .delete-row-button:hover {
        background-color: #cc0000;
    }

    .available-buttons-section {
        margin-top: 2rem;
        border: 1px solid var(--border-gray);
        border-radius: 8px;
        padding: 1rem;
        background-color: var(--second-color);
    }

    .available-buttons-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        padding: 0.5rem;
        border: 1px dashed var(--gray-text);
        border-radius: 5px;
        min-height: 80px;
        background-color: var(--first-color);
    }

    .available-button {
        background-color: var(--decor-green);
        color: white;
        padding: 0.6rem 1rem;
        border-radius: 5px;
        cursor: grab;
        user-select: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 150px;
    }
    .available-button:active {
        cursor: grabbing;
    }

    .empty-drop-target {
        flex-grow: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px dashed var(--border-gray);
        border-radius: 5px;
        color: var(--gray-text);
        padding: 1rem;
        font-style: italic;
    }

    .empty-keyboard-drop-target {
        width: 100%;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px dashed var(--border-gray);
        border-radius: 5px;
        color: var(--gray-text);
        font-style: italic;
        margin-top: 0.5rem;
    }
</style>    