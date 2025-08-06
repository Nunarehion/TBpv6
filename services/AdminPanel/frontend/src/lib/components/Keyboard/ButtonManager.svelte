<script>
    import { onMount, createEventDispatcher } from 'svelte';

    let { availableButtons = [], loadingAvailableButtons = false, errorAvailableButtons = null } = $props();

    let newButtonText = $state('');
    let newButtonCallbackData = $state('');
    let creatingNewButton = $state(false);
    let newButtonError = $state(null);

    const dispatch = createEventDispatcher();

    function addOnClick(button) {
        dispatch('addButton', button);
    }

    async function fetchAvailableButtons() {
        loadingAvailableButtons = true;
        errorAvailableButtons = null;
        try {
            const response = await fetch('/api/buttons');
            if (!response.ok) {
                throw new Error(`Failed to fetch 'buttons' buttons: ${response.statusText}`);
            }
            const data = await response.json();
            availableButtons = data.map((buttonDoc) => ({
                id: buttonDoc._id,
                text:
                    buttonDoc.text ||
                    buttonDoc.label ||
                    buttonDoc.name ||
                    `Кнопка ${String(buttonDoc._id).slice(-4)}`,
                callback_data: buttonDoc.callback_data || ''
            }));
        } catch (error) {
            errorAvailableButtons = error.message;
        } finally {
            loadingAvailableButtons = false;
        }
    }

    onMount(async () => {
        await fetchAvailableButtons();
    });

    async function createNewButton() {
        newButtonError = null;
        if (!newButtonText.trim() || !newButtonCallbackData.trim()) {
            newButtonError = 'Пожалуйста, введите текст и callback_data для новой кнопки.';
            return;
        }
        creatingNewButton = true;
        try {
            const response = await fetch('/api/buttons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: newButtonText.trim(),
                    callback_data: newButtonCallbackData.trim()
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при создании кнопки на сервере.');
            }
            await fetchAvailableButtons();
            newButtonText = '';
            newButtonCallbackData = '';
        } catch (error) {
            newButtonError = error.message;
        } finally {
            creatingNewButton = false;
        }
    }
</script>

<div class="form-group available-buttons-section">
    <label>Доступные кнопки:</label>
    <div
        class="available-buttons-list"
        on:dragover|preventDefault
    >
        {#if loadingAvailableButtons}
            <p>Загрузка доступных кнопок...</p>
        {:else if errorAvailableButtons}
            <p class="error-message">Ошибка загрузки кнопок: {errorAvailableButtons}</p>
        {:else if availableButtons.length > 0}
            {#each availableButtons as button (button.id)}
                <div
                    class="available-button"
                    draggable="true"
                    on:dragstart={(e) => {
                        const data = {
                            button: button,
                            isNew: true,
                            source: {
                                row: -1,
                                index: -1
                            }
                        };
                        e.dataTransfer.setData('application/json', JSON.stringify(data));
                        e.dataTransfer.effectAllowed = 'move';
                    }}
                    on:click={() => addOnClick(button)}
                >
                    <span>{button.text}</span>
                    <span class="callback-data-display">{button.callback_data}</span>
                </div>
            {/each}
        {:else}
            <p>Кнопки в коллекции 'кнопко' не найдены. Добавьте их сначала!</p>
        {/if}
    </div>
    <div class="new-button-creator">
        <input type="text" bind:value={newButtonText} placeholder="Текст новой кнопки" />
        <input
            type="text"
            bind:value={newButtonCallbackData}
            placeholder="Callback Data"
            on:keydown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    createNewButton();
                }
            }}
        />
        <button
            type="button"
            on:click={createNewButton}
            class="create-new-button"
            disabled={creatingNewButton}
        >
            {#if creatingNewButton}
                Создание...
            {:else}
                Создать новую кнопку
            {/if}
        </button>
    </div>
    {#if newButtonError}
        <p class="error-message">{newButtonError}</p>
    {/if}
</div>

<style>
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
        max-height: 250px;
        overflow-y: auto;
    }
    .available-button {
        background-color: var(--decor-green);
        color: white;
        padding: 0.6rem 1rem;
        border-radius: 5px;
        cursor: pointer; /* Изменено, чтобы было понятно, что на кнопку можно нажать */
        user-select: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 150px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.2rem;
        font-size: 0.9rem;
        touch-action: none;
    }
    .available-button:active {
        cursor: grabbing;
    }
    .available-button span {
        max-width: 10rem;
        display: block;
        text-overflow: ellipsis;
        overflow: hidden;
    }
    .new-button-creator {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 1rem;
        align-items: center;
    }
    .new-button-creator input {
        flex-grow: 1;
        width: auto;
        min-width: 120px;
    }
    .create-new-button {
        background-color: var(--blue);
        color: white;
        border: none;
        padding: 0.75rem 1rem;
        border-radius: 5px;
        cursor: pointer;
        white-space: nowrap;
        font-size: 0.9rem;
    }
    .create-new-button:hover {
        background-color: var(--blue-dark);
    }
    .create-new-button:disabled {
        background-color: #666;
        cursor: not-allowed;
    }
    .error-message {
        background-color: #631c26;
        color: white;
        padding: 0.75rem;
        border-radius: 5px;
        margin-top: 0.5rem;
        font-size: 0.9rem;
    }
</style>