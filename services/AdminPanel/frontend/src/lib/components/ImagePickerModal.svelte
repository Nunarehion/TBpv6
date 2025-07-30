<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	import {
		images,
		loadingImages,
		error,
		fetchImages,
		uploadImage,
		loadingImageUpload
	} from '$lib/stores/db.js';

	import ImageGridItem from '$lib/components/ImageGridItem.svelte';

	const dispatch = createEventDispatcher();
	const DB_IMAGE_ROOT_URL = 'http://admin_backend:3000';

	let selectedImageIds = $state(new Set());
	let uploadFile = $state(null);
	let currentUploadError = $state(null);

	let selectedCount = $derived(selectedImageIds.size);

	onMount(() => {
		fetchImages();
	});

	function handleToggleSelect(event) {
		const { filename, isSelected: newIsSelectedState } = event.detail;

		const newSelectedImageIds = new Set(selectedImageIds);

		if (newIsSelectedState) {
			newSelectedImageIds.add(filename);
		} else {
			newSelectedImageIds.delete(filename);
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
			const fileInput = document.getElementById('imageUploadInput');
			if (fileInput) fileInput.value = '';

			await fetchImages();
		} catch (e) {
			currentUploadError = e.message;
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
			<input type="file" id="imageUploadInput" bind:files={uploadFile} accept="image/*" />
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
						<ImageGridItem
							{image}
							isSelected={selectedImageIds.has(image.filename)}
							on:toggleSelect={handleToggleSelect}
						/>
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
	.upload-section input[type='file'] {
		margin-right: 1rem;
		padding: 0.5rem;
		border: 1px solid var(--border-gray);
		border-radius: 4px;
		background-color: var(--second-color);
		color: var(--main-text);
	}
	.upload-section button {
		background-color: var(--decor-green);
		color: white;
		padding: 0.6rem 1rem;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}
	.upload-section button:hover {
		background-color: #218838;
	}
	.upload-section button:disabled {
		background-color: #666;
		cursor: not-allowed;
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
	}
	.modal-actions button:first-child {
		background-color: var(--action-button-color);
		color: white;
	}
	.modal-actions button:first-child:hover:not(:disabled) {
		background-color: var(--action-button-hover-color);
	}
	.modal-actions button:last-child {
		background-color: var(--second-color);
		color: var(--main-text);
		border: 1px solid var(--border-gray);
	}
	.modal-actions button:last-child:hover {
		background-color: var(--hover-color);
	}
	.modal-actions button:disabled {
		background-color: #666;
		cursor: not-allowed;
		color: #ccc;
	}
	.error-message {
		color: var(--decor-red);
		margin-top: 0.5rem;
		font-size: 0.9rem;
	}
</style>
