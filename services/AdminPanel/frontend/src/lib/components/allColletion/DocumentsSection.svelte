<script>
	import DocumentCard from './DocumentCard.svelte';
	import { createEventDispatcher } from 'svelte';

	export let documents = [];
	export let loading = false;
	export let selectedCollection;

	const dispatch = createEventDispatcher();

	function handleSave(doc) {
		dispatch('save', doc);
	}
</script>

{#if selectedCollection}
	<h2>Документы из коллекции: {selectedCollection}</h2>

	{#if loading}
		<p>Загрузка документов...</p>
	{:else if documents.length === 0}
		<p>Документы отсутствуют</p>
	{:else}
		<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem;">
			{#each documents as doc (doc._id)}
				<DocumentCard {doc} on:save={(e) => dispatch('save', e.detail)} />

			{/each}
		</div>
	{/if}
{/if}
