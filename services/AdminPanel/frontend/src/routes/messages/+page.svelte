<script>
	import CollectionMessage from '$lib/components/CollectionMessage.svelte';
	import { documents, loadingDocuments, saveDocument, loadDocuments } from '$lib/stores/db.js';
	import { onMount } from 'svelte';

	const collectionName = 'message';

	onMount(() => {
		loadDocuments(collectionName);
	});

	function handleSave(doc) {
		saveDocument(collectionName, doc);
	}
</script>

<h1>Сообщения</h1>

<CollectionMessage
	documents={$documents}
	loading={$loadingDocuments}
	selectedCollection={collectionName}
	on:save={(e) => handleSave(e.detail)}
/>
