<script>
    import { createEventDispatcher } from 'svelte';

    export let buttons = [];
    export let availableButtons = [];

    function handleDragStart(event, button, rowIdx, btnIdx, isNew) {
        const data = {
            button: button,
            isNew,
            source: { row: rowIdx, index: btnIdx }
        };
        event.dataTransfer.setData('application/json', JSON.stringify(data));
        event.dataTransfer.effectAllowed = 'move';
    }

    function handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    function handleDrop(event, targetRowIdx, targetBtnIdx = -1) {
        event.preventDefault();
        const dataString = event.dataTransfer.getData('application/json');
        if (!dataString) return;

        let data;
        try {
            data = JSON.parse(dataString);
        } catch (e) {
            console.error('Failed to parse drag data:', e);
            return;
        }

        let newButtons = JSON.parse(JSON.stringify(buttons));

        if (!data.isNew && data.source.row !== -1) {
            newButtons[data.source.row].splice(data.source.index, 1);
            if (newButtons[data.source.row].length === 0) {
                newButtons.splice(data.source.row, 1);
                if (data.source.row < targetRowIdx) {
                    targetRowIdx--;
                }
            }
        }
        
        if (targetRowIdx === -1) {
            newButtons.push([data.button]);
        } else {
            if (!newButtons[targetRowIdx]) {
                newButtons.splice(targetRowIdx, 0, []);
            }
            if (targetBtnIdx === -1) {
                newButtons[targetRowIdx].push(data.button);
            } else {
                newButtons[targetRowIdx].splice(targetBtnIdx, 0, data.button);
            }
        }
        buttons = newButtons;
    }

    function removeButton(rowIdx, btnIdx) {
        let newButtons = JSON.parse(JSON.stringify(buttons));
        newButtons[rowIdx].splice(btnIdx, 1);
        if (newButtons[rowIdx].length === 0) {
            newButtons.splice(rowIdx, 1);
        }
        buttons = newButtons;
    }

    function mergeRowWithPrevious(rowIdx) {
        if (rowIdx === 0) return;
        let newButtons = JSON.parse(JSON.stringify(buttons));
        const rowToMerge = newButtons.splice(rowIdx, 1)[0];
        newButtons[rowIdx - 1] = [...newButtons[rowIdx - 1], ...rowToMerge];
        buttons = newButtons;
    }
</script>

<div class="keyboard-preview">
    {#each buttons as row, rowIdx}
        <div
            class="button-row"
            on:dragover={handleDragOver}
            on:drop={(e) => handleDrop(e, rowIdx, -1)}
        >
            {#each row as buttonId, btnIdx}
                {#if availableButtons.find(b => b._id === buttonId) as button}
                    <div
                        class="keyboard-button"
                        draggable="true"
                        on:dragstart={(e) => handleDragStart(e, button, rowIdx, btnIdx, false)}
                        on:dragover={handleDragOver}
                        on:drop={(e) => handleDrop(e, rowIdx, btnIdx)}
                    >
                        <span>{button.text || 'Нет текста'}</span>
                        <span class="callback-data-display">{button.callback_data || 'Нет данных'}</span>
                        <button
                            type="button"
                            class="remove-button"
                            on:click={() => removeButton(rowIdx, btnIdx)}>&times;</button
                        >
                    </div>
                {/if}
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
            {#if buttons.length > 1 && rowIdx > 0}
                <button
                    type="button"
                    class="merge-row-button"
                    on:click={() => mergeRowWithPrevious(rowIdx)}
                >
                    Слить с предыдущей строкой
                </button>
            {/if}
        </div>
    {/each}
    <div class="add-row-drop-zone" on:drag



<style>
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
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        background-color: var(--action-button-color);
        color: white;
        padding: 0.6rem 1rem;
        padding-right: 2rem;
        border-radius: 5px;
        cursor: grab;
        gap: 0.2rem;
        user-select: none;
        position: relative;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 0.9rem;
        touch-action: none;
    }
    .keyboard-button:active {
        cursor: grabbing;
    }
    .keyboard-button span {
        max-width: 10rem;
        display: block;
        text-overflow: ellipsis;
        overflow: hidden;
    }
    .keyboard-button span:first-child {
        font-weight: bold;
    }
    .callback-data-display {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.7);
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
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
        position: absolute;
        top: 5px;
        right: 5px;
    }
    .remove-button:hover {
        color: var(--decor-red);
    }
    .add-row-drop-zone {
        background-color: rgba(var(--decor-green-rgb), 0.2);
        color: var(--decor-green);
        border: 1px dashed var(--decor-green);
        border-radius: 5px;
        padding: 0.8rem 1rem;
        margin-top: 0.5rem;
        text-align: center;
        cursor: default;
        user-select: none;
        font-weight: bold;
        transition:
            background-color 0.2s ease,
            border-color 0.2s ease;
    }
    .add-row-drop-zone:hover {
        background-color: rgba(var(--decor-green-rgb), 0.3);
        border-color: #218838;
    }
    .merge-row-button {
        background-color: #f0ad4e;
        color: white;
        border: none;
        padding: 0.4rem 0.8rem;
        border-radius: 5px;
        cursor: pointer;
        margin-left: auto;
        font-size: 0.85rem;
    }
    .merge-row-button:hover {
        background-color: #ec971f;
    }
</style>