<script>
	import {
		collections,
		documents,
		selectedCollection,
		loadingDocuments,
		error,
		saveDocument,
		loadDocuments
	} from '$lib/stores/db.js';
	import CollectionList from '$lib/components/allColletion/CollectionList.svelte';
	import DocumentsSection from '$lib/components/allColletion/DocumentsSection.svelte';
</script>

<h1>Список коллекций из MongoDB</h1>

{#if $error}
	<p style="color: red">Ошибка: {$error}</p>
{:else if $collections.length === 0}
	<p>Загрузка коллекций...</p>
{:else}
<div class="wrap">
	<CollectionList
		collections={$collections}
		selected={$selectedCollection}
		loadingDocuments={$loadingDocuments}
		on:select={(e) => loadDocuments(e.detail)}
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

</style>