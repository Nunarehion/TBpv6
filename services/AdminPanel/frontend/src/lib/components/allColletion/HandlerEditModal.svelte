<script>
    import { createEventDispatcher } from 'svelte';
    import { slide } from 'svelte/transition';
    import { onMount } from 'svelte';

    let { doc, columns = [] } = $props();

    const dispatch = createEventDispatcher();

    let editableDoc = $state({
        ...doc,
        wait_input_var: !!doc.wait_input_var,
        input_var: doc.wait_input_var ? (doc.input_var || 'input') : undefined
    });

    let availableButtonCallbacks = $state([]);
    let loadingButtonCallbacks = $state(true);
    let errorButtonCallbacks = $state(null);

    let availableMessageNames = $state([]);
    let loadingMessageNames = $state(true);
    let errorMessageNames = $state(null);

    async function fetchAvailableButtons() {
        loadingButtonCallbacks = true;
        errorButtonCallbacks = null;
        try {
            const response = await fetch('/api/buttons');
            if (!response.ok) {
                throw new Error(`Ошибка загрузки кнопок: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            availableButtonCallbacks = data
                .filter((button) => button.callback_data)
                .map((button) => ({
                    id: button._id,
                    value: button.callback_data,
                    text: button.text || button.label || `Кнопка ${String(button._id).slice(-4)}`
                }));
        } catch (error) {
            console.error('Error fetching buttons:', error);
            errorButtonCallbacks = error.message;
        } finally {
            loadingButtonCallbacks = false;
        }
    }

    async function fetchAvailableMessages() {
        loadingMessageNames = true;
        errorMessageNames = null;
        try {
            const response = await fetch('/api/message');
            if (!response.ok) {
                throw new Error(`Ошибка загрузки сообщений: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            availableMessageNames = data
                .filter((message) => message.name)
                .map((message) => ({
                    id: message._id,
                    value: message.name,
                    text:
                        message.text ||
                        message.label ||
                        message.title ||
                        `Сообщение ${String(message._id).slice(-4)}`
                }));
        } catch (error) {
            console.error('Error fetching messages:', error);
            errorMessageNames = error.message;
        } finally {
            loadingMessageNames = false;
        }
    }

    onMount(async () => {
        await Promise.allSettled([fetchAvailableButtons(), fetchAvailableMessages()]);
    });

    function handleInput(field, value) {
        editableDoc = { ...editableDoc, [field]: value };
    }

    function handleCheckboxChange(event) {
        const checked = event.target.checked;
        editableDoc = { ...editableDoc, wait_input_var: checked };
        if (checked && editableDoc.input_var === undefined) {
            // Если включили ожидание ввода и input_var ещё не задан,
            // устанавливаем его в 'input' по умолчанию
            editableDoc = { ...editableDoc, input_var: 'input' };
        } else if (!checked) {
            // Если выключили ожидание ввода, сбрасываем input_var
            editableDoc = { ...editableDoc, input_var: undefined };
        }
    }

    function save() {
        dispatch('save', editableDoc);
    }

    function cancel() {
        dispatch('cancel');
    }
</script>

<div class="modal-overlay" transition:slide>
    <div class="modal-content">
        <h2>Редактировать триггер</h2>
        <form on:submit|preventDefault={save}>
            {#each columns as col}
                {#if col !== '_id'}
                    <div class="form-group">
                        <label for={col}>{col.replace(/_/g, ' ')}:</label>
                        {#if col === 'pattern'}
                            <input
                                type="text"
                                id={col}
                                bind:value={editableDoc[col]}
                                on:input={(e) => handleInput(col, e.target.value)}
                                list="button-callbacks"
                                placeholder="Введите или выберите callback_data"
                            />
                            <datalist id="button-callbacks">
                                {#if loadingButtonCallbacks}
                                    <option value="" disabled>Загрузка...</option>
                                {:else if errorButtonCallbacks}
                                    <option value="" disabled>Ошибка: {errorButtonCallbacks}</option>
                                {:else if availableButtonCallbacks.length > 0}
                                    {#each availableButtonCallbacks as item (item.id)}
                                        <option value={item.value} title={item.text}>{item.value}</option>
                                    {/each}
                                {:else}
                                    <option value="" disabled>Нет доступных callback_data</option>
                                {/if}
                            </datalist>
                        {:else if col === 'message_name'}
                            <input
                                type="text"
                                id={col}
                                bind:value={editableDoc[col]}
                                on:input={(e) => handleInput(col, e.target.value)}
                                list="message-names"
                                placeholder="Введите или выберите название сообщения"
                            />
                            <datalist id="message-names">
                                {#if loadingMessageNames}
                                    <option value="" disabled>Загрузка...</option>
                                {:else if errorMessageNames}
                                    <option value="" disabled>Ошибка: {errorMessageNames}</option>
                                {:else if availableMessageNames.length > 0}
                                    {#each availableMessageNames as item (item.id)}
                                        <option value={item.value} title={item.text}>{item.value}</option>
                                    {/each}
                                {:else}
                                    <option value="" disabled>Нет доступных сообщений</option>
                                {/if}
                            </datalist>
                        {:else}
                            <input
                                type="text"
                                id={col}
                                bind:value={editableDoc[col]}
                                on:input={(e) => handleInput(col, e.target.value)}
                            />
                        {/if}
                    </div>
                {/if}
            {/each}

            <div class="form-group checkbox-group">
                <input
                    type="checkbox"
                    id="wait_input_var_checkbox"
                    bind:checked={editableDoc.wait_input_var}
                    on:change={handleCheckboxChange}
                />
                <label for="wait_input_var_checkbox">Ожидать ввод пользователя?</label>
            </div>

            {#if editableDoc.wait_input_var}
                <div class="form-group" transition:slide>
                    <label for="input_var">Имя переменной для ввода:</label>
                    <input
                        type="text"
                        id="input_var"
                        bind:value={editableDoc.input_var}
                        on:input={(e) => handleInput('input_var', e.target.value)}
                        placeholder="Например: user_age"
                    />
                </div>
            {/if}

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
        max-width: 600px;
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

    .checkbox-group {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 1rem;
    }

    .checkbox-group input[type="checkbox"] {
        width: auto;
        margin: 0;
        padding: 0;
        height: 16px;
        width: 16px;
        accent-color: var(--action-button-color);
        cursor: pointer;
    }

    .checkbox-group label {
        margin-bottom: 0;
        display: inline-block;
        font-weight: normal;
        cursor: pointer;
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