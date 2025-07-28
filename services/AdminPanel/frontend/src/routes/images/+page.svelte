<script>
    import { onMount } from 'svelte';
    import {
        images,
        loadingImages,
        loadingImageUpload,
        error,
        fetchImages,
        uploadImage,
        deleteImage
    } from '$lib/stores/db.js';

    let fileInput;

    const DB_IMAGE_BASE_URL = "http://admin_backend:3000/uploads/";


    onMount(() => {
        loadImagesList();
    });

    async function loadImagesList() {
        try {
            await fetchImages();
        } catch (e) {
            console.error('Ошибка при загрузке списка изображений:', e);
        }
    }

    async function handleFileUpload() {
        if (!fileInput || fileInput.files.length === 0) {
            alert('Пожалуйста, выберите файл для загрузки.');
            return;
        }
        const file = fileInput.files[0];
        try {
            const result = await uploadImage(file);
            alert(`Изображение "${result.filename}" успешно загружено!`);
            fileInput.value = '';
            loadImagesList();
        } catch (e) {
            alert(`Ошибка загрузки: ${e.message}`);
        }
    }

    async function handleDeleteImage(filename) {
        if (!confirm(`Вы уверены, что хотите удалить изображение "${filename}"?`)) {
            return;
        }
        try {
            await deleteImage(filename);
            alert(`Изображение "${filename}" успешно удалено!`);
            loadImagesList();
        } catch (e) {
            alert(`Ошибка удаления: ${e.message}`);
        }
    }

    function handleRefresh() {
        loadImagesList();
    }

    function handleImageError(event) {
        event.target.onerror = null;
        event.target.src = 'https://placehold.co/150x120/cccccc/000000?text=Error';
        console.warn(`Не удалось загрузить изображение: ${event.target.alt}. Установлена заглушка.`);
    }
</script>

<div class="image-management-container">
    <h2>Управление изображениями</h2>

    <div class="upload-section">
        <h3>Загрузить новое изображение</h3>
        <input type="file" bind:this={fileInput} accept="image/*" />
        <button on:click={handleFileUpload} disabled={$loadingImageUpload}>
            {#if $loadingImageUpload}
                Загрузка...
            {:else}
                Загрузить изображение
            {/if}
        </button>
        {#if $error}
            <p class="error-message">Ошибка: {$error}</p>
        {/if}
    </div>

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
        {:else if $error}
            <p class="error-message">Не удалось загрузить список изображений: {$error}</p>
        {:else if $images && $images.length === 0}
            <p>Изображений пока нет. Загрузите первое!</p>
        {:else if $images}
            <div class="image-grid">
                {#each $images as image (image.filename)}
                    <div class="image-item">
                        <img src={image.url} alt={image.filename} on:error={handleImageError} />
                        <p>
                            <a href={`${DB_IMAGE_BASE_URL}${image.filename}`} target="_blank" rel="noopener noreferrer">
                                {`${DB_IMAGE_BASE_URL}${image.filename}`}
                            </a>
                        </p>
                        <button class="delete-button" on:click={() => handleDeleteImage(image.filename)}>Удалить</button>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    .image-management-container {
        padding: 20px;
        background-color: var(--first-color);
        color: var(--main-text);
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        max-width: 900px;
        margin: 20px auto;
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

    .upload-section input[type='file'] {
        background-color: var(--first-color);
        color: var(--main-text);
        border: 1px solid var(--border-gray);
        padding: 10px;
        border-radius: 5px;
        width: 100%;
        max-width: 300px;
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
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 20px;
        justify-content: center;
    }

    .image-item {
        background-color: var(--first-color);
        border: 1px solid var(--border-gray);
        border-radius: 8px;
        padding: 10px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
    }

    .image-item img {
        max-width: 100%;
        height: 120px;
        object-fit: contain;
        border-radius: 4px;
        margin-bottom: 10px;
        background-color: #000;
        flex-shrink: 0;
    }

    .image-item p {
        font-size: 0.85rem;
        word-break: break-all;
        color: var(--gray-text);
        margin-bottom: 10px;
        flex-grow: 1;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .image-item p a {
        color: var(--blue);
        text-decoration: none;
    }

    .image-item p a:hover {
        text-decoration: underline;
    }

    .delete-button {
        background-color: var(--decor-red);
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background-color 0.3s ease;
        margin-top: auto;
        width: 100%;
    }

    .delete-button:hover {
        background-color: #dc3545;
    }
</style>