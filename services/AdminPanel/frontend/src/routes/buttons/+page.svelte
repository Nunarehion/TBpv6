<script>
	import DocumentPreview from '$lib/components/DocumentPreview.svelte';
	import {
		documents,
		loadingDocuments,
		saveDocument,
		loadDocuments,
		addDocument,
		deleteDocument
	} from '$lib/stores/db.js';
	import { onMount } from 'svelte';

	const collectionName = 'buttons';

	onMount(() => {
		loadDocuments(collectionName);
	});

	function handleSave(doc) {
		saveDocument(collectionName, doc);
	}

	async function handleAdd(doc) {
		await addDocument(collectionName, doc);
	}

	async function handleDelete(doc) {
		await deleteDocument(collectionName, doc._id);
	}
</script>

<h1>Кнопки</h1>

<DocumentPreview
	documents={$documents}
	loading={$loadingDocuments}
	selectedCollection={collectionName}
	on:save={(e) => handleSave(e.detail)}
	on:add={(e) => handleAdd(e.detail)}
	on:delete={(e) => handleDelete(e.detail)}
/>
