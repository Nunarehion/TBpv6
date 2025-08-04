<script>
    import { createEventDispatcher } from 'svelte';

    export let doc;
    const dispatch = createEventDispatcher();

    let localDoc = structuredClone(doc);
    let expanded = false;
    let saving = false;
    let jsonString = JSON.stringify(localDoc, null, 2);

    async function handleSave() {
        saving = true;
        try {
            localDoc = JSON.parse(jsonString);
            dispatch('save', localDoc);
        } catch (error) {
            console.error("Ошибка парсинга JSON:", error);
            alert("Ошибка парсинга JSON. Пожалуйста, проверьте формат.");
        }
        saving = false;
    }

    function handleCancel() {
        localDoc = structuredClone(doc);
        jsonString = JSON.stringify(localDoc, null, 2);
        dispatch('cancel');
    }

    $: jsonString = JSON.stringify(localDoc, null, 2);
</script>

<div class="card">
    <form on:submit|preventDefault={handleSave}>
        {#each Object.entries(localDoc) as [key, value]}
            <div class="field">
                <label for={'field-' + key}>{key}</label>
                <input
                    id={'field-' + key}
                    type="text"
                    bind:value={localDoc[key]}
                    readonly={key === '_id'}
                />
            </div>
        {/each}

        <div class="field">
            <label for="json-editor">Редактировать JSON</label>
            <textarea
                id="json-editor"
                bind:value={jsonString}
                rows="10"
                style="resize: none;"
            ></textarea>
        </div>

        <div class="card-footer actions">
            <button type="submit" disabled={saving}>💾 Сохранить</button>
            <button type="button" on:click={handleCancel} disabled={saving}>Отмена</button>
            <button type="button" on:click={() => (expanded = !expanded)}>
                {expanded ? '▲ Скрыть JSON' : '▼ Показать JSON'}
            </button>
        </div>
    </form>

    {#if expanded}
        <pre class="json">{JSON.stringify(doc, null, 2)}</pre>
    {/if}
</div>

<style>
    .card {
        background: var(--first-color);
        border: 1px solid var(--border-gray);
        border-radius: 0.5rem;
        padding: 1.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .card form {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    .field {
        margin-bottom: 0.75rem;
        display: flex;
        flex-direction: column;
    }

    label {
        font-weight: 500;
        margin-bottom: 0.25rem;
        color: var(--gray-text);
        margin-top: 0.5rem;
    }

    input {
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--border-gray);
        border-radius: 0.25rem;
        background-color: var(--second-color);
        color: var(--main-text);
        font-size: 1rem;
    }

    input[readonly] {
        background-color: var(--second-color);
        opacity: 0.7;
        cursor: not-allowed;
    }

    .actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
        justify-content: flex-end;
    }

    .card-footer {
        margin-top: auto;
    }

    button {
        padding: 0.75rem 1rem;
        border: none;
        border-radius: 0.375rem;
        background-color: var(--blue);
        color: white;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background-color 0.2s ease;
    }

    button:hover:not(:disabled) {
        background-color: #1a56db;
    }

    button:disabled {
        background-color: var(--border-gray);
        cursor: not-allowed;
        opacity: 0.6;
    }

    .json {
        background: var(--second-color);
        padding: 1rem;
        margin-top: 1rem;
        border-radius: 0.5rem;
        font-size: 0.85rem;
        color: var(--main-text);
        white-space: pre-wrap;
        word-break: break-all;
        overflow-x: auto;
