<script>
	import DocumentRow from './DocumentRow.svelte';
	import { createEventDispatcher } from 'svelte';

	export let documents = [];
	export let orderedFields = [];

	const dispatch = createEventDispatcher();

	$: columns = [];

	$: {
		if (documents.length === 0) {
			columns = [];
		} else if (orderedFields.length > 0) {
			const allKeys = Array.from(new Set(documents.flatMap((doc) => Object.keys(doc))));
			const presentPriority = orderedFields.filter((key) => allKeys.includes(key));
			const restKeys = allKeys.filter((key) => !presentPriority.includes(key));
			columns = [...presentPriority, ...restKeys];
		} else {
			columns = Array.from(new Set(documents.flatMap((doc) => Object.keys(doc))));
		}
	}

	let editingId = null;

	function onStartEdit(event) {
		editingId = event.detail._id;
	}

	function onCancelEdit() {
		editingId = null;
	}

	function onSave(event) {
		dispatch('save', event.detail);
		editingId = null;
	}
</script>

{#if documents.length === 0}
	<p>Документы отсутствуют</p>
{:else}
	<div class="tabel-wrap">
		<div class="tools-panel"></div>
		<div
			class="table-grid"
			style={`grid-template-columns: 40px repeat(${columns.length}, 1fr) auto;`}
		>
			<div class="table-header"></div>
			{#each columns as col}
				<div class="table-header">{col}</div>
			{/each}
			<div class="table-header">Действия</div>

			{#each documents as doc (doc._id)}
				<DocumentRow
					{doc}
					{columns}
					{editingId}
					on:startEdit={onStartEdit}
					on:cancelEdit={onCancelEdit}
					on:save={onSave}
				/>
			{/each}
		</div>
	</div>
{/if}

<style>
	.table-grid {
		display: grid;
	}

	.table-header {
		font-weight: bold;
		border-bottom: 2px solid #007acc;
		padding-bottom: 0.25rem;
		background: var(--second-color);
		color: var(--gray-text);
		padding: 1rem;
	}

	.tabel-wrap {
		background: var(--first-color);
		overflow: hidden;
		border-radius: 1rem 1rem 0 0;
		box-shadow: 0 0 2px #00000022;
		border: 1px solid var(--border-gray);
	}
	.tools-panel {
		height: 5rem;
	}
</style>
