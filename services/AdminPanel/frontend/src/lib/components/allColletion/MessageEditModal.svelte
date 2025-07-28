<script>
    import { createEventDispatcher, onMount, tick } from 'svelte';
    import ToggleSwitch from '$lib/components/ToggleSwitch.svelte';
    import KeyboardEditModal from '$lib/components/allColletion/KeyboardEditModal.svelte';

    let { doc, columns } = $props();

    const dispatch = createEventDispatcher();

    let editedDoc = $state({
        ...doc,
        text: doc.text ? convertNewlinesToBr(doc.text) : '', 
        images: Array.isArray(doc.images) ? doc.images.join('\n') : '',
        keyboard_name: doc.keyboard_name || ''
    });

    let contentEditableDiv = $state();
    let rawHtmlTextarea = $state();
    let imagesTextarea = $state();

    let internalUpdate = false;
    let isRawHtmlMode = $state(false);
    let availableKeyboards = $state([]);
    let loadingKeyboards = $state(true); 
    let errorKeyboards = $state(null);

    let showKeyboardEditModal = $state(false);      
    let currentKeyboardForEdit = $state(null);      
    let keyboardEditModalColumns = ['name', 'buttons'];

    function convertNewlinesToBr(text) {
        if (typeof text !== 'string') return '';
        let processedText = text.replace(/&nbsp;/g, ' ');
        processedText = processedText.replace(/\n/g, '<br>');
        return processedText;
    }

    function normalizeHtmlForDatabase(html) {
        if (typeof html !== 'string') return '';

        let result = html;

        result = result.replace(/<br\s*\/?>/gi, '\n');

        result = result.replace(/<\s*(p|div)\b[^>]*>(.*?)<\/\s*\1\s*>/gis, (match, tag, content) => {
            let normalizedContent = content
                                    .replace(/<br\s*\/?>/gi, '\n')
                                    .replace(/&nbsp;/g, ' ')
                                    .trim();

            return (normalizedContent ? normalizedContent : '') + '\n\n';
        });

        const allowedTagsPattern = '(b|i|u|s|a|code|pre)';
        result = result.replace(new RegExp(`<(?!\/?(${allowedTagsPattern})[^>]*?>)[^>]+>`, 'gi'), '');
        result = result.replace(new RegExp(`<\/(?!\/?(${allowedTagsPattern})[^>]*?>)[^>]+>`, 'gi'), '');

        result = result.replace(/&nbsp;/g, ' ');
        result = result.replace(/\r/g, '');
        result = result.replace(/ +/g, ' ');
        result = result.trim();

        return result;
    }

    function formatText(command, value = null) {
        if (contentEditableDiv) {
            contentEditableDiv.focus();
            document.execCommand(command, false, value);
            editedDoc.text = contentEditableDiv.innerHTML;
            contentEditableDiv.dispatchEvent(new Event('input'));
        }
    }

    function createLink() {
        const url = prompt('Введите URL ссылки:', 'http://');
        if (url) {
            formatText('createLink', url);
        }
    }

    function unlinkText() {
        formatText('unlink');
    }

    function insertMonospace() {
        if (contentEditableDiv) {
            contentEditableDiv.focus();
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const selectedText = range.toString();
                if (selectedText) {
                    document.execCommand('insertHTML', false, `<code>${selectedText}</code>`);
                } else {
                    document.execCommand('insertHTML', false, '<code></code>');
                    const newRange = document.createRange();
                    newRange.selectNodeContents(contentEditableDiv);
                    newRange.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }
            }
            editedDoc.text = contentEditableDiv.innerHTML;
            contentEditableDiv.dispatchEvent(new Event('input'));
        }
    }

    function insertPreformatted() {
        if (contentEditableDiv) {
            contentEditableDiv.focus();
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const selectedText = range.toString();
                if (selectedText) {
                    document.execCommand('insertHTML', false, `<pre>${selectedText}</pre>`);
                } else {
                    document.execCommand('insertHTML', false, '<pre></pre>');
                    const newRange = document.createRange();
                    newRange.selectNodeContents(contentEditableDiv);
                    newRange.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }
            }
            editedDoc.text = contentEditableDiv.innerHTML;
            contentEditableDiv.dispatchEvent(new Event('input'));
        }
    }

    function clearFormatting() {
        formatText('removeFormat');
    }

    function handleInputEvent() {
        if (!internalUpdate) {
            editedDoc.text = contentEditableDiv.innerHTML;
        }
    }

    function handleRawHtmlInput(event) {
        editedDoc.text = event.target.value;
    }

    async function handleToggleChange(event) {
        isRawHtmlMode = event.detail; 

        if (isRawHtmlMode) {
            if (contentEditableDiv) {
                editedDoc.text = normalizeHtmlForDatabase(contentEditableDiv.innerHTML);
            }
        } else {
            await tick(); 
            if (contentEditableDiv) {
                internalUpdate = true; 
                contentEditableDiv.innerHTML = convertNewlinesToBr(editedDoc.text);
                internalUpdate = false;
            }
        }
    }

    async function fetchAvailableKeyboards() {
        loadingKeyboards = true;
        errorKeyboards = null;
        try {
            const response = await fetch('/api/keyboards');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to fetch keyboards: ${response.statusText}`);
            }
            const data = await response.json();
            availableKeyboards = data;
            if (!editedDoc.keyboard_name && availableKeyboards.length > 0) {
                editedDoc.keyboard_name = '';
            }
        } catch (error) {
            errorKeyboards = error.message;
        } finally {
            loadingKeyboards = false;
        }
    }

    function openKeyboardEdit() {
        if (editedDoc.keyboard_name) {
            currentKeyboardForEdit = availableKeyboards.find((kb) => kb.name === editedDoc.keyboard_name);
            if (!currentKeyboardForEdit) {
                currentKeyboardForEdit = { name: editedDoc.keyboard_name, buttons: [] };
            }
        } else {
            currentKeyboardForEdit = { name: '', buttons: [] };
        }
        showKeyboardEditModal = true;
    }

    async function handleKeyboardSave(event) {
        const updatedKeyboard = event.detail;

        try {
            const method = updatedKeyboard._id ? 'PUT' : 'POST';
            const url = updatedKeyboard._id ? `/api/keyboards/${updatedKeyboard._id}` : '/api/keyboards';

            const { _id, ...dataToSend } = updatedKeyboard;

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSend)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to save keyboard: ${response.statusText}`);
            }

            const savedKeyboardResponse = await response.json();
            const finalSavedKeyboard = updatedKeyboard._id ? updatedKeyboard : savedKeyboardResponse;

            await fetchAvailableKeyboards();

            if (finalSavedKeyboard.name) {
                editedDoc.keyboard_name = finalSavedKeyboard.name;
            } else {
                editedDoc.keyboard_name = '';
            }
        } catch (error) {
            alert(`Ошибка сохранения клавиатуры: ${error.message}`);
        }

        showKeyboardEditModal = false;
        currentKeyboardForEdit = null;
    }

    function handleKeyboardCancel() {
        showKeyboardEditModal = false;
        currentKeyboardForEdit = null;
    }

    onMount(() => {
        if (contentEditableDiv && !isRawHtmlMode) {
            internalUpdate = true;
            contentEditableDiv.innerHTML = editedDoc.text;
            internalUpdate = false;
        }
        fetchAvailableKeyboards();
    });

    $effect(() => {
        if (!isRawHtmlMode && contentEditableDiv && editedDoc.text !== contentEditableDiv.innerHTML) {
            internalUpdate = true;
            contentEditableDiv.innerHTML = convertNewlinesToBr(editedDoc.text);
            internalUpdate = false;
        }
    });

    function handleSave() {
        const docToSave = { ...editedDoc };

        if (typeof docToSave.text === 'string') {
            docToSave.text = normalizeHtmlForDatabase(docToSave.text);
        }

        if (typeof docToSave.images === 'string') {
            docToSave.images = docToSave.images.split('\n').filter(Boolean);
        }

        dispatch('save', docToSave);
    }

    function handleCancel() {
        dispatch('cancel');
    }
</script>

<div class="modal-overlay">
    <div class="modal-content">
        <h3>Редактировать сообщение</h3>
        <form on:submit|preventDefault={handleSave}>
            {#each columns as col}
                {#if col !== '_id'}
                    <div class="form-group">
                        <label for={col}>{col}:</label>
                        {#if col === 'text'}
                            <div class="toolbar">
                                <button type="button" on:click={() => formatText('bold')}><b>B</b></button>
                                <button type="button" on:click={() => formatText('italic')}><i>I</i></button>
                                <button type="button" on:click={() => formatText('underline')}><u>U</u></button>
                                <button type="button" on:click={createLink}>🔗</button>
                                <button type="button" on:click={unlinkText}>🔗&#x20E0;</button>
                                <button type="button" on:click={insertMonospace}><code>&lt;/&gt;</code></button>
                                <button type="button" on:click={insertPreformatted}>{'<pre>'}</button>
                                <button type="button" on:click={clearFormatting}>🚫</button>
                                <ToggleSwitch
                                    checked={isRawHtmlMode}
                                    on:change={handleToggleChange}
                                    label="Режим разметки"
                                />
                            </div>
                            {#if isRawHtmlMode}
                                <textarea
                                    bind:this={rawHtmlTextarea}
                                    bind:value={editedDoc.text}
                                    class="raw-html-editor"
                                    on:input={handleRawHtmlInput}
                                    rows="10"
                                    placeholder="Введите HTML-разметку"
                                ></textarea>
                            {:else}
                                <div
                                    bind:this={contentEditableDiv}
                                    contenteditable="true"
                                    class="text-editor"
                                    on:input={handleInputEvent}
                                ></div>
                            {/if}
                        {:else if col === 'images'}
                            <textarea
                                bind:this={imagesTextarea}
                                bind:value={editedDoc.images}
                                class="images-editor"
                                on:input={handleImagesInput}
                                placeholder="Введите URL изображений, по одному на строку"
                                rows="5"
                            ></textarea>
                        {:else if col === 'keyboard_name'}
                            <div class="keyboard-selection-group">
                                <select bind:value={editedDoc.keyboard_name} disabled={loadingKeyboards}>
                                    <option value="">Нет клавиатуры</option>
                                    {#if loadingKeyboards}
                                        <option value="" disabled>Загрузка...</option>
                                    {:else if errorKeyboards}
                                        <option value="" disabled>Ошибка: {errorKeyboards}</option>
                                    {:else}
                                        {#each availableKeyboards as keyboard}
                                            <option value={keyboard.name}>{keyboard.name}</option>
                                        {/each}
                                    {/if}
                                </select>
                                <button type="button" on:click={openKeyboardEdit} class="edit-keyboard-button">
                                    {editedDoc.keyboard_name
                                        ? 'Редактировать клавиатуру'
                                        : 'Создать/Редактировать клавиатуру'}
                                </button>
                            </div>
                        {:else}
                            <input type="text" id={col} bind:value={editedDoc[col]} />
                        {/if}
                    </div>
                {/if}
            {/each}
            <div class="modal-actions">
                <button type="submit" class="action-button save-button">Сохранить</button>
                <button type="button" on:click={handleCancel} class="action-button cancel-button">Отмена</button>
            </div>
        </form>
    </div>
</div>

{#if showKeyboardEditModal}
    <KeyboardEditModal
        doc={currentKeyboardForEdit}
        columns={keyboardEditModalColumns}
        on:save={handleKeyboardSave}
        on:cancel={handleKeyboardCancel}
    />
{/if}

<style>
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
        color: var(--main-text);
        border: 1px solid var(--border-gray);
        width: 90%;
        max-width: 700px;
        max-height: 90vh;
        overflow-y: auto;
    }

    h3 {
        text-align: center;
        margin-bottom: 1.5rem;
        color: var(--gray-text);
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: bold;
        color: var(--main-text);
    }

    .form-group input[type='text'],
    .images-editor {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border-gray);
        border-radius: 4px;
        background-color: var(--second-color);
        color: var(--main-text);
        box-sizing: border-box;
        font-size: 1rem;
        resize: vertical;
    }

    .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        padding: 0.5rem;
        border: 1px solid var(--border-gray);
        border-radius: 4px 4px 0 0;
        background-color: var(--second-color);
    }

    .toolbar button {
        background: none;
        color: white;
        border: none;
        padding: 0.5rem 0.8rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.2s ease;
        min-width: 40px;
    }

    .toolbar button:hover {
    }

    .text-editor {
        width: 100%;
        min-height: 200px;
        padding: 0.75rem;
        border: 1px solid var(--border-gray);
        border-top: none;
        border-radius: 0 0 4px 4px;
        background-color: var(--second-color);
        color: var(--main-text);
        box-sizing: border-box;
        font-size: 1rem;
        outline: none;
        overflow-y: auto;
    }

    .raw-html-editor {
        width: 100%;
        min-height: 200px;
        padding: 0.75rem;
        border: 1px solid var(--border-gray);
        border-top: none;
        border-radius: 0 0 4px 4px;
        background-color: var(--second-color);
        color: var(--main-text);
        box-sizing: border-box;
        font-family: monospace;
        font-size: 0.9rem;
        outline: none;
        resize: vertical;
    }

    .keyboard-selection-group {
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }

    .keyboard-selection-group select {
        flex-grow: 1;
        padding: 0.75rem;
        border: 1px solid var(--border-gray);
        border-radius: 4px;
        background-color: var(--second-color);
        color: var(--main-text);
        font-size: 1rem;
    }

    .edit-keyboard-button {
        padding: 0.75rem 1rem;
        background-color: var(--blue);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        white-space: nowrap;
    }

    .edit-keyboard-button:hover {
        background-color: var(--blue-dark);
    }

    .modal-actions {
        margin-top: 2rem;
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
    }

    .action-button {
        padding: 0.6rem 1.2rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        transition:
            background-color 0.2s ease,
            color 0.2s ease;
    }

    .save-button {
        background-color: var(--action-button-color);
        color: white;
    }

    .save-button:hover {
        background-color: var(--action-button-hover-color);
    }

    .cancel-button {
        background-color: var(--second-button-color);
        color: var(--main-text);
    }

    .cancel-button:hover {
        background-color: #4b5563;
    }
</style>