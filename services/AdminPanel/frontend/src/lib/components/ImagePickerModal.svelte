<script>
    import { onMount, createEventDispatcher } from 'svelte';
    import { slide } from 'svelte/transition';
    import { writable } from 'svelte/store';

    const dispatch = createEventDispatcher();

    const API_BASE_URL = '/api/images';
    const DB_IMAGE_ROOT_URL = 'http://admin_backend:3000';

    const images = writable([]);
    const loadingImages = writable(false);
    const loadingImageUpload = writable(false);
    const error = writable(null);

    let selectedImageIds = $state(new Set());
    let uploadFile = $state(null);
    let currentUploadError = $state(null);
    let fileNameDisplay = $state('Файл не выбран');

    let selectedCount = $derived(selectedImageIds.size);

    async function fetchImages() {
        loadingImages.set(true);
        error.set(null);
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Не удалось загрузить список изображений.');
            }
            const data = await response.json();
            images.set(data.images);
        } catch (e) {
            error.set(e.message);
        } finally {
            loadingImages.set(false);
        }
    }

    async function uploadImage(file) {
        loadingImageUpload.set(true);
        error.set(null);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Не удалось загрузить изображение.');
            }

            error.set(null);
            return await response.json();
        } catch (e) {
            error.set(e.message);
            throw e;
        } finally {
            loadingImageUpload.set(false);
        }
    }

    onMount(() => {
        fetchImages();
    });

    function handleToggleSelect(filename) {
        const newSelectedImageIds = new Set(selectedImageIds);
        if (newSelectedImageIds.has(filename)) {
            newSelectedImageIds.delete(filename);
        } else {
            newSelectedImageIds.add(filename);
        }
        selectedImageIds = newSelectedImageIds;
    }

    async function handleUpload() {
        if (!uploadFile || uploadFile.length === 0) {
            currentUploadError = 'Пожалуйста, выберите файл для загрузки.';
            return;
        }
        currentUploadError = null;
        try {
            await uploadImage(uploadFile[0]);
            uploadFile = null;
            fileNameDisplay = 'Файл не выбран';
            const fileInput = document.getElementById('imageUploadInput');
            if (fileInput) fileInput.value = '';
            await fetchImages();
        } catch (e) {
            currentUploadError = e.message;
        }
    }

    function updateFileNameDisplay(event) {
        const files = event.target.files;
        if (files.length > 0) {
            uploadFile = files;
            fileNameDisplay = files[0].name;
        } else {
            uploadFile = null;
            fileNameDisplay = 'Файл не выбран';
        }
    }

    function insertSelected() {
        const urlsToInsert = $images
            .filter((img) => selectedImageIds.has(img.filename))
            .map((img) => DB_IMAGE_ROOT_URL + img.url);
        dispatch('insertImages', urlsToInsert);
        dispatch('close');
    }

    function cancel() {
        dispatch('close');
    }
</script>

<div class="modal-overlay" transition:slide>
    <div class="modal-content">
        <h3>Выбор и загрузка картинок</h3>

        <div class="upload-section">
            <h4>Загрузить новую картинку</h4>
            <div class="file-input-group">
                <input
                    type="file"
                    id="imageUploadInput"
                    on:change={updateFileNameDisplay}
                    accept="image/*"
                    hidden
                />
                <label for="imageUploadInput" class="file-label-with-button">
                    <span class="custom-file-button">Выбрать файл</span>
                    <span class="file-name-display">{fileNameDisplay}</span>
                </label>
            </div>
            <button on:click={handleUpload} disabled={$loadingImageUpload}>
                {#if $loadingImageUpload}Загрузка...{:else}Загрузить{/if}
            </button>
            {#if currentUploadError}<p class="error-message">{currentUploadError}</p>{/if}
            {#if $error && $error.includes('загрузк')}<p class="error-message">
                    Ошибка из стора: {$error}
                </p>{/if}
        </div>

        <hr />

        <div class="existing-images-section">
            <h4>Доступные картинки</h4>
            {#if $loadingImages}
                <p>Загрузка картинок...</p>
            {:else if $error}
                <p class="error-message">Ошибка загрузки: {$error}</p>
            {:else if $images.length === 0}
                <p>Пока нет загруженных картинок.</p>
            {:else}
                <div class="image-grid">
                    {#each $images as image (image.filename)}
                        {@const isSelected = selectedImageIds.has(image.filename)}
                        <div
                            class="image-item"
                            class:selected={isSelected}
                            on:click={() => handleToggleSelect(image.filename)}
                        >
                            <img src={image.url} alt={image.filename} />
                            {#if isSelected}
                                <div class="checkmark">✔</div>
                            {/if}
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

        <div class="modal-actions">
            <button on:click={insertSelected} disabled={selectedCount === 0}>
                Вставить выбранные ({selectedCount})
            </button>
            <button on:click={cancel}>Отмена</button>
        </div>
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
        z-index: 1001;
    }
    .modal-content {
        background-color: var(--first-color);
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        width: 90%;
        max-width: 700px;
        max-height: 80vh;
        overflow-y: auto;
        color: var(--main-text);
        border: 1px solid var(--border-gray);
    }
    h3,
    h4 {
        color: var(--blue);
        margin-top: 0;
        margin-bottom: 1rem;
    }

    .file-input-group {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
    }

    .file-label-with-button {
        display: flex;
        flex-grow: 1;
        align-items: center;
        border: 1px solid var(--border-gray);
        border-radius: 5px;
        background-color: var(--second-color);
        cursor: pointer;
        overflow: hidden;
        transition: box-shadow 0.2s ease, border-color 0.2s ease;
        min-height: 36px;
    }

    .file-label-with-button:hover {
        border-color: var(--action-button-color);
        box-shadow: 0 0 0 2px rgba(var(--action-button-color-rgb), 0.3);
    }

    .file-label-with-button:focus-within {
        outline: none;
        border-color: var(--action-button-color);
        box-shadow: 0 0 0 3px rgba(var(--action-button-color-rgb), 0.4);
    }

    .file-name-display {
        flex-grow: 1;
        color: var(--gray-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 0.9rem;
        padding-left: 12px;
        padding-right: 8px;
    }

    .custom-file-button {
        flex-shrink: 0;
        background-color: var(--info-message-bg);
        color: var(--first-color);
        padding: 8px 16px;
        transition: none;
        font-size: 0.9rem;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        order: -1;
        border-radius: 8px;
        color: white;
        border: var(--decor-green) 1px solid;
        margin: .5rem;
    }

    .upload-section button {
        background-color: var(--decor-green);
        color: white;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.2s ease, box-shadow 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        font-size: 1rem;
        margin-top: 1rem;
    }
    .upload-section button:hover:not(:disabled) {
        background-color: #218838;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
    .upload-section button:disabled {
        background-color: #666;
        cursor: not-allowed;
        box-shadow: none;
    }
    hr {
        border: 0;
        height: 1px;
        background-color: var(--border-gray);
        margin: 1.5rem 0;
    }
    .image-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 1rem;
        padding: 1rem;
        max-height: 300px;
        overflow-y: auto;
        border: 1px dashed var(--gray-text);
        border-radius: 5px;
        background-color: var(--second-color);
    }
    .image-item {
        position: relative;
        cursor: pointer;
        border-radius: 4px;
        overflow: hidden;
        border: 2px solid transparent;
        transition: border-color 0.2s ease;
        aspect-ratio: 1/1;
    }
    .image-item.selected {
        border-color: var(--action-button-color);
    }
    .image-item img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .checkmark {
        position: absolute;
        top: 5px;
        right: 5px;
        background-color: var(--action-button-color);
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8em;
    }
    .modal-actions {
        margin-top: 1.5rem;
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
    }
    .modal-actions button {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    .modal-actions button:first-child {
        background-color: var(--action-button-color);
        color: white;
    }
    .modal-actions button:first-child:hover:not(:disabled) {
        background-color: var(--action-button-hover-color);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
    .modal-actions button:last-child {
        background-color: var(--second-color);
        color: var(--main-text);
        border: 1px solid var(--border-gray);
    }
    .modal-actions button:last-child:hover {
        background-color: var(--hover-color);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
    }
    .modal-actions button:disabled {
        background-color: #666;
        cursor: not-allowed;
        color: #ccc;
        box-shadow: none;
    }
    .error-message {
        color: var(--decor-red);
        margin-top: 0.5rem;
        font-size: 0.9rem;
    }
</style>