<script>
	import sprite from '$lib/static/sprite.svg?raw';
	import { onMount } from 'svelte';

	let ids = [];

	onMount(() => {
		const parser = new DOMParser();
		const doc = parser.parseFromString(sprite, 'image/svg+xml');
		const elementsWithId = doc.querySelectorAll('[id]');
		ids = Array.from(elementsWithId).map((element) => element.id);
	});
</script>

<ul>
	{#each ids as id}
		<li>
			<svg class="icon">
				<use href={`/sprite.svg#${id}`}></use>
			</svg>
			<span>{`<svg class="icon"><use href="/sprite.svg#${id}"></use></svg>`}</span>
			<!-- sprite.svg#{id} -->
		</li>
	{/each}
</ul>

<style>
	ul {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
	}
	svg {
		height: 100%;
		width: 100%;
	}
	li {
		display: grid;
		grid-template-columns: 0.25fr 1fr;
		align-items: center;
		padding: 0.5rem;
		border: 1px solid var(--border-gray);
		color: var(--gray-text);
		height: 4rem;
	}
	li:hover {
		color: white;
	}
	span {
		user-select: all;
		font-weight: bold;
		font-size: 1rem;
	}
</style>
