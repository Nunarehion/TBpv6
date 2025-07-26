<script>
	import { createEventDispatcher } from 'svelte';
	import { fetchSchema } from '$lib/stores/db.js';
	import DocumentCard from '$lib/components/allColletion/DocumentCard.svelte';
	import DocumentsTable from '$lib/components/allColletion/DocumentsTable.svelte';

	export let documents = [];
	export let loading = false;
	export let selectedCollection;

	const dispatch = createEventDispatcher();

	let viewMode = 'table';

	function toggleView(mode) {
		viewMode = mode;
	}

	async function handleAdd() {
		if (!selectedCollection) return;

		const fields = await fetchSchema(selectedCollection);

		const newDoc = {};
		for (const key of fields) {
			newDoc[key] = '';
		}

		dispatch('add', newDoc);
	}
	function handleSave(doc) {
		dispatch('save', doc);
	}
	function handleDelete(doc) {
		dispatch('delete', doc);
	}

	const fieldPriority = ['name'];
	function getOrderedFields(doc) {
		const keys = Object.keys(doc);
		const presentPriority = fieldPriority.filter((k) => keys.includes(k));
		const rest = keys.filter((k) => !presentPriority.includes(k));
		return [...presentPriority, ...rest];
	}

	$: orderedFields = documents.length > 0 ? getOrderedFields(documents[0]) : [];
</script>

{#if selectedCollection}
	<div class="wrap">
		<div class="tabs-panel" style="margin-bottom: 1rem;">
			<button on:click={() => toggleView('cards')} disabled={viewMode === 'cards'}>
				<svg class="icon"><use href="/sprite.svg#objects-column"></use></svg>
				Карточки
			</button>
			<button on:click={() => toggleView('table')} disabled={viewMode === 'table'}>
				<svg class="icon"><use href="/sprite.svg#column"></use></svg>
				Таблица
			</button>
		</div>

		{#if loading}
			<p>Загрузка документов...</p>
		{:else if documents.length === 0 && viewMode === 'cards'}
			<p>Документы отсутствуют</p>
		{/if}

		{#if viewMode === 'cards'}
			<div
				style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem;"
			>
				{#each documents as doc (doc._id)}
					<DocumentCard {doc} on:save={(e) => handleSave(e.detail)} />
				{/each}
			</div>
		{:else if viewMode === 'table'}
			<DocumentsTable
				{documents}
				{orderedFields}
				on:save={(e) => handleSave(e.detail)}
				on:add={handleAdd}
				on:delete={(e) => handleDelete(e.detail)}
			/>
		{/if}
	</div>
{/if}

<style>
	.wrap {
		display: grid;
		padding: 2rem;
	}
	.tabs-panel {
		margin-left: auto;
	}
	.icon {
		width: 4rem;
		aspect-ratio: 1/1;
	}
	button:disabled {
		background: red;
		transform: scale(0.9);
	}
</style>
