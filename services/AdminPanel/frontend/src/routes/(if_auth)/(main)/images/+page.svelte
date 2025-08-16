<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { slide } from 'svelte/transition';

    const images = writable([]);
    const loadingImages = writable(false);
    const loadingImageUpload = writable(false);
    const error = writable(null);

    let uploadFile = null;
    let fileNameDisplay = 'Файл не выбран';
    let previewImageUrl = null;

    const DB_IMAGE_BASE_URL = '/uploads/';
    const API_BASE_URL = '/api/images';

    onMount(() => {
        loadImagesList();
    });

    async function loadImagesList() {
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
            console.error('Ошибка при получении списка изображений:', e);
            error.set(e.message);
        } finally {
            loadingImages.set(false);
        }
    }

    async function handleUpload() {
        if (!uploadFile || uploadFile.length === 0) {
            alert('Пожалуйста, выберите файл для загрузки.');
            return;
        }
        const file = uploadFile[0];
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

            const data = await response.json();
            alert(`Изображение "${file.name}" успешно загружено!`);
            uploadFile = null;
            fileNameDisplay = 'Файл не выбран';
            loadImagesList();
            return data;
        } catch (e) {
            console.error('Ошибка при загрузке изображения:', e);
            alert(`Ошибка загрузки: ${e.message}`);
            error.set(e.message);
        } finally {
            loadingImageUpload.set(false);
        }
    }

    async function handleDeleteImage(filename) {
        if (!confirm(`Вы уверены, что хотите удалить изображение "${filename}"?`)) {
            return;
        }
        error.set(null);
        try {
            const response = await fetch(`${API_BASE_URL}/${filename}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Не удалось удалить изображение.');
            }

            const data = await response.json();
            alert(`Изображение "${filename}" успешно удалено!`);
            loadImagesList();
            return data;
        } catch (e) {
            console.error('Ошибка при удалении изображения:', e);
            alert(`Ошибка удаления: ${e.message}`);
            error.set(e.message);
        }
    }

    function handleRefresh() {
        loadImagesList();
    }

    function handleImageError(event) {
        event.target.onerror = null;
        event.target.src = 'https://placehold.co/200x150/cccccc/000000?text=Error';
        console.warn(`Не удалось загрузить изображение: ${event.target.alt}. Установлена заглушка.`);
    }

    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            alert('Ссылка скопирована!');
        } catch (err) {
            console.error('Не удалось скопировать текст с помощью Clipboard API:', err);
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                alert('Ссылка скопирована (через запасной метод)!');
            } catch (execCommandErr) {
                console.error('Не удалось скопировать текст с помощью execCommand:', execCommandErr);
                alert('Ошибка при копировании ссылки. Пожалуйста, скопируйте вручную.');
            } finally {
                document.body.removeChild(textArea);
            }
        }
    }

    function showImagePreview(url) {
        previewImageUrl = url;
    }

    function closeImagePreview() {
        previewImageUrl = null;
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
</script>

<div class="image-management-container">
    <h2>Управление изображениями</h2>

    <div class="upload-section">
        <h3>Загрузить новое изображение</h3>
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
            {#if $loadingImageUpload}
                Загрузка...
            {:else}
                Загрузить изображение
            {/if}
        </button>
        {#if $error && $error.includes('загрузк')}
            <p class="error-message">Ошибка: {$error}</p>
        {/if}
    </div>

    <hr />

    <div class="image-list-section">
        <div class="list-header">
            <h3>Существующие изображения</h3>
            <button on:click={handleRefresh} disabled={$loadingImages}>
                {#if $loadingImages}
                    Обновление...
                {:else}
                    Обновить список
                {/if}
            </button>
        </div>

        {#if $loadingImages}
            <p>Загрузка изображений...</p>
        {:else if $error && !$error.includes('загрузк')}
            <p class="error-message">Не удалось загрузить список изображений: {$error}</p>
        {:else if $images && $images.length === 0}
            <p>Изображений пока нет. Загрузите первое!</p>
        {:else if $images}
            <div class="image-grid">
                {#each $images as image (image.filename)}
                    <div class="image-item">
                        <img
                            src={image.url}
                            alt={image.filename}
                            on:error={handleImageError}
                            on:click={() => showImagePreview(image.url)}
                        />
                        <div class="image-controls">
                            <button
                                class="copy-button"
                                on:click={() => copyToClipboard(`${DB_IMAGE_BASE_URL}${image.filename}`)}
                            >
                                Копировать ссылку
                            </button>
                            <button class="delete-button" on:click={() => handleDeleteImage(image.filename)}>
                                <svg class="icon"><use href="/sprite.svg#trash-bin"></use></svg>
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

{#if previewImageUrl}
    <div
        class="image-preview-overlay"
        role="button"
        tabindex="0"
        aria-label="Закрыть предпросмотр"
        on:click={closeImagePreview}
        on:keydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                closeImagePreview();
            }
        }}
    >
        <div
            class="image-preview-content"
            role="dialog"
            aria-modal="true"
            tabindex="0"
            on:click|stopPropagation
            on:keydown|stopPropagation
        >
            <button
                class="close-preview-button"
                on:click={closeImagePreview}
                aria-label="Закрыть предпросмотр">&times;</button
            >
            <img src={previewImageUrl} alt="Предпросмотр изображения" />
        </div>
    </div>
{/if}

<style>
    .image-management-container {
        padding: 20px;
        background-color: var(--first-color);
        color: var(--main-text);
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    h2,
    h3 {
        color: var(--gray-text);
        text-align: center;
        margin-bottom: 20px;
    }

    .upload-section {
        background-color: var(--second-color);
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
    }

    .file-input-group {
        display: flex;
        align-items: center;
        width: 100%;
        max-width: 300px;
    }

    .file-label-with-button {
        display: flex;
        flex-grow: 1;
        align-items: center;
        border: 1px solid #ffffff33;
        border-radius: 12px;
        background-color: var(--first-color);
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
         border: 1px solid #ffffff33;
        margin: .5rem;
    }

    .upload-section button {
        background-color: var(--action-button-color);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.3s ease;
    }

    .upload-section button:hover:not(:disabled) {
        background-color: var(--action-button-hover-color);
    }

    .upload-section button:disabled {
        background-color: #6c757d;
        cursor: not-allowed;
    }

    .error-message {
        color: var(--decor-red);
        margin-top: 10px;
        text-align: center;
    }

    .image-list-section {
        background-color: var(--second-color);
        padding: 20px;
        border-radius: 8px;
    }

    .list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .list-header h3 {
        margin: 0;
    }

    .list-header button {
        background-color: var(--action-button-color);
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background-color 0.3s ease;
    }

    .list-header button:hover:not(:disabled) {
        background-color: var(--action-button-hover-color);
    }

    .list-header button:disabled {
        background-color: #6c757d;
        cursor: not-allowed;
    }

    .image-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 20px;
        justify-content: center;
    }

    .image-item {
        background-color: var(--first-color);
        border: 1px solid var(--border-gray);
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        height: 200px;
        cursor: pointer;
    }

    .image-item img {
        display: block;
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        border-radius: 4px;
        background-color: #000;
        padding: 5px;
        flex-grow: 1;
    }

    .image-controls {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        transform: translateY(100%);
        transition: transform 0.15s ease-out;
        background-color: rgba(55, 65, 81, 0.7);
        backdrop-filter: blur(2px);
        display: flex;
        justify-content: space-around;
        align-items: center;
        padding: 8px 5px;
        box-sizing: border-box;
    }

    .image-item:hover .image-controls {
        transform: translateY(0);
    }

    .image-controls button {
        border: 1px solid #ffffff33;
        background-color: transparent;
        color: var(--main-text);
        padding: 5px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
        transition:
            background-color 0.2s ease,
            color 0.2s ease;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .image-controls button:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .copy-button {
        color: var(--gray-text);
    }

    .copy-button:hover {
        color: var(--main-text);
    }

    .delete-button .icon {
        fill: var(--decor-red);
    }

    .delete-button:hover {
        background-color: rgba(219, 45, 45, 0.2);
    }

    .delete-button .icon {
        width: 20px;
        height: 20px;
        vertical-align: middle;
    }

    .image-preview-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .image-preview-content img {
        max-width: 100%;
        max-height: 80vh;
        width: auto;
        height: auto;
        object-fit: contain;
        display: block;
        margin: 0 auto;
    }

    .image-preview-content img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .close-preview-button {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 2rem;
        color: white;
        cursor: pointer;
        line-height: 1;
        padding: 0;
        z-index: 1001;
        transition: color 0.2s ease;
    }

    .close-preview-button:hover {
        color: var(--decor-red);
    }
</style>