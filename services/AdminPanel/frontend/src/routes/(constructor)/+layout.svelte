<!-- <script>
	import DocumentPreview from '$lib/components/DocumentPreview.svelte';

	import { onMount } from 'svelte';
	import {
		documents,
		loadingDocuments,
		saveDocument,
		loadDocuments,
		addDocument,
		deleteDocument
	} from '$lib/stores/_db.js';

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
</script> -->
