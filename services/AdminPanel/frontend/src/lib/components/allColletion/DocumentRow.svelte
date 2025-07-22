<script>
	import { createEventDispatcher } from 'svelte';
	import Checkbox from './Checkbox.svelte';
	let isChecked = false;

	export let doc;
	export let columns = [];
	export let editingId = null;

	const dispatch = createEventDispatcher();

	let editDoc = { ...doc };

	$: if (editingId !== doc._id) {
		editDoc = { ...doc };
	}

	function startEdit() {
		dispatch('startEdit', doc);
	}

	function cancelEdit() {
		dispatch('cancelEdit');
	}

	function saveEdit() {
		dispatch('save', editDoc);
	}

	let checked = false;
</script>

<div class="table-cell">
	<Checkbox bind:checked={isChecked}></Checkbox>
</div>
{#each columns as col}
	<div class="table-cell" class:name-text={col.trim() === 'name'}>
		{#if editingId === doc._id}
			{#if col === '_id'}
				{editDoc[col]}
			{:else}
				<input type="text" bind:value={editDoc[col]} />
			{/if}
		{:else if col.trim() === 'text'}
			<span title={doc[col]}>
				{doc[col]?.length > 15 ? doc[col].slice(0, 15) + '…' : (doc[col] ?? '-')}
			</span>
		{:else}
			{doc[col] ?? '-'}
		{/if}
	</div>
{/each}

<div class="table-cell">
	{#if editingId === doc._id}
		<button on:click={saveEdit} aria-label="Сохранить">
			<svg class="icon"><use href="/sprite.svg#floppy-disk"></use></svg>
		</button>
		<button on:click={cancelEdit} aria-label="Отмена"
			><svg class="icon"><use href="/sprite.svg#close-circle"></use></svg>
		</button>
	{:else}
		<button on:click={startEdit} aria-label="Редактирование">
			<svg class="icon">
				<use href="/sprite.svg#pen"></use>
			</svg>
		</button>
	{/if}
</div>

<style>
	.table-cell {
		display: flex;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 2px solid #9ca3af33;
		color: var(--gray-text);
		padding: 1rem;
	}
	input[type='text'] {
		width: 100%;
		padding: 0.2rem 0.4rem;
		border: 1px solid #ccc;
		border-radius: 4px;
	}
	button {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #007acc;
		color: white;
		border: none;
		border-radius: 6px;
		padding: 0.3rem 0.6rem;
		cursor: pointer;
		margin-right: 0.25rem;
	}
	button:hover {
		background-color: #005fa3;
	}
	button:disabled {
		background-color: var(--gray-text);
		cursor: not-allowed;
	}

	.icon {
		width: 1.5rem;
		aspect-ratio: 1/1;
	}
</style>
