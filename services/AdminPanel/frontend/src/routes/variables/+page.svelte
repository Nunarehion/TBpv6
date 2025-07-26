<script>
	import DocumentPreview from '$lib/components/DocumentPreview.svelte';
	import { documents, loadingDocuments, saveDocument, loadDocuments } from '$lib/stores/db.js';
	import { onMount } from 'svelte';

	const collectionName = 'variables';

	onMount(() => {
		loadDocuments(collectionName);
	});

	function handleSave(doc) {
		saveDocument(collectionName, doc);
	}
</script>

<h1>переменные</h1>

<DocumentPreview
	documents={$documents}
	loading={$loadingDocuments}
	selectedCollection={collectionName}
	on:save={(e) => handleSave(e.detail)}
/>
