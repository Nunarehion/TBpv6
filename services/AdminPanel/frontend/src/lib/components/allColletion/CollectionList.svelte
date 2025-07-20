<script>
	import { createEventDispatcher } from 'svelte';
	export let collections = [];
	export let selected = null;
	export let loadingDocuments = false;

	const dispatch = createEventDispatcher();
</script>

<ul>
	{#each collections as name}
		<li>
			<button
				class:selected={selected === name}
				on:click={() => dispatch('select', name)}
				disabled={loadingDocuments && selected === name}
			>
				{name}
			</button>
		</li>
	{/each}
</ul>

<style>
	ul {
		display: flex;
		margin: 1rem;
	}
	button {
		background: none;
		border: 1px solid var(--border-gray);
	}
	button.selected {
		font-weight: bold;
		border: 1px solid var(--blue);
	}
</style>
