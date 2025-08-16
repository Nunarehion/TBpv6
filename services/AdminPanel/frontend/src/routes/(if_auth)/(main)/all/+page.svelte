<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import CollectionList from '$lib/components/allColletion/CollectionList.svelte';
	import DocumentsSection from '$lib/components/allColletion/DocumentsSection.svelte';
	export let data;

	const selectedCollection = writable(null);
	const documents = writable([]);
	const loadingDocuments = writable(false);
	const fetchError = writable(null);

	async function loadDocumentsForCollection(collectionName) {
		selectedCollection.set(collectionName);
		loadingDocuments.set(true);
		fetchError.set(null);

		try {
			const encodedCollectionName = encodeURIComponent(collectionName);
			const res = await fetch(`/api/${encodedCollectionName}`);
			if (!res.ok) {
				const errData = await res.json();
				throw new Error(errData.error || `HTTP error! Status: ${res.status}`);
			}
			const fetchedDocuments = await res.json();
			documents.set(fetchedDocuments);
		} catch (e) {
			console.error(`Error loading documents for ${collectionName}:`, e);
			fetchError.set(e.message);
			documents.set([]);
		} finally {
			loadingDocuments.set(false);
		}
	}

	async function saveDocument(collectionName, documentData) {
		try {
			const response = await fetch(`/api/${encodeURIComponent(collectionName)}/save`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(documentData)
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
			}

			const result = await response.json();
			alert(result.message || 'Документ успешно сохранен!');
		} catch (error) {
			console.error('Ошибка при сохранении документа:', error);
			alert('Ошибка при сохранении документа: ' + error.message);
		}
	}

	onMount(() => {
		if (data.collections.length > 0) {
			loadDocumentsForCollection(data.collections[0]);
		}
	});

	let backupFile;
	let overwriteCheckbox = false;
	async function exportBackup() {
		try {
			const res = await fetch('/api/backup');
			if (!res.ok) {
				const errData = await res.json();
				throw new Error(errData.error || `HTTP error! Status: ${res.status}`);
			}
			const blob = await res.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `backup_${new Date().toISOString()}.gz`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			window.URL.revokeObjectURL(url);
			alert('Резервная копия успешно экспортирована!');
		} catch (e) {
			alert('Ошибка при экспорте резервной копии: ' + e.message);
		}
	}

	async function importBackup() {
		if (!backupFile || backupFile.length === 0) {
			alert('Пожалуйста, выберите файл резервной копии.');
			return;
		}

		const formData = new FormData();
		formData.append('backupFile', backupFile[0]);
		formData.append('overwrite', overwriteCheckbox);

		try {
			const res = await fetch('/api/backup', {
				method: 'POST',
				body: formData
			});

			if (!res.ok) {
				const errData = await res.json();
				throw new Error(errData.error || `HTTP error! Status: ${res.status}`);
			}

			const result = await res.json();
			alert(result.message);
		} catch (e) {
			console.error('Ошибка импорта:', e);
			alert('Ошибка при импорте резервной копии: ' + e.message);
		}
	}
</script>

<div class="backup-controls">
	<div>
		<p>Создать полную резервную копию базы данных.</p>
		<button on:click={exportBackup}>Экспортировать резервную копию</button>
	</div>

	<hr />

	<form on:submit|preventDefault={importBackup}>
		<p>Загрузить файл для восстановления базы данных.</p>
		<div class="file-input-group">
			<label for="backupFile" class="file-label-with-button">
				<span class="file-name-display">
					{backupFile && backupFile.length > 0 ? backupFile[0].name : 'Выберите файл...'}
				</span>
				<span class="custom-file-button">Выбрать файл</span>
			</label>
			<input
				id="backupFile"
				type="file"
				bind:files={backupFile}
				accept=".gz"
				required
				style="display: none;"
			/>
		</div>
		<button class="import-button" type="submit">Импортировать резервную копию</button>
		<label class="overwrite-label">
			<input type="checkbox" bind:checked={overwriteCheckbox} />
			Очистить базу данных перед импортом
		</label>
	</form>
	<hr>
		<nav>
		<button on:click={handleLogout}>Выйти из аккакунта</button>
	</nav>
</div>

{#if $fetchError}
	<p style="color: red">Ошибка загрузки документов: {$fetchError}</p>
{:else if data.collections.length === 0}
	<p>Загрузка коллекций...</p>
{:else}
	<div class="wrap">
		<CollectionList
			collections={data.collections}
			selected={$selectedCollection}
			loadingDocuments={$loadingDocuments}
			on:select={(e) => loadDocumentsForCollection(e.detail)}
		/>
	</div>
	{#if $selectedCollection}
		<DocumentsSection
			documents={$documents}
			loading={$loadingDocuments}
			selectedCollection={$selectedCollection}
			on:save={(e) => saveDocument($selectedCollection, e.detail)}
		/>
	{/if}
{/if}

<style>
	.backup-controls {
		display: flex;
		flex-direction: column-reverse;
		margin-top: 2rem;
		padding: 2rem;
		background-color: var(--first-color);
		border: 1px solid var(--border-gray);
		border-radius: 8px;
	}

	.backup-controls h3 {
		margin-bottom: 1rem;
	}

	.backup-controls p {
		margin-bottom: 0.5rem;
	}

	.backup-controls button {
		padding: 0.5rem 1rem;
		border-radius: 4px;
		background-color: #3b82f6;
		color: white;
		border: none;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.backup-controls button:hover {
		background-color: #2563eb;
	}

	.backup-controls hr {
		margin: 1.5rem 0;
		border-color: var(--border-gray);
	}
	.file-input-group {
		display: flex;
		align-items: center;
		width: 100%;
		max-width: 300px;
		flex-direction: column;
		gap: 1rem;
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
		transition:
			box-shadow 0.2s ease,
			border-color 0.2s ease;
		min-height: 36px;
		width: 100%;
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
		border-radius: 8px;
		color: white;
		border: 1px solid #ffffff33;
		margin: 0.5rem;
	}
	.backup-controls form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 1rem;
	}
	.overwrite-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--gray-text);
	}
	.import-button {
		width: fit-content;
	}
</style>
