<script>
	import { createEventDispatcher } from 'svelte';

	let searchQuery = $state('');

	const dispatch = createEventDispatcher();

	function handleChange() {
		dispatch('search', searchQuery);
	}
</script>

<div class="search-input-container">
	<input
		type="text"
		placeholder="Поиск..."
		bind:value={searchQuery}
		on:input={handleChange}
		class="search-input"
	/>
	<svg class="icon"><use href="/sprite.svg#search"></use></svg>
</div>

<style>
	.search-input-container {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
		max-width: 300px;
	}

	.search-input {
		padding: 10px 15px;
		border: 1px solid var(--border-gray);
		border-radius: 5px;
		background-color: var(--second-color);
		color: var(--main-text);
		font-size: 1rem;
		width: 100%;
		box-sizing: border-box;
		padding-right: 40px;
	}

	.search-input::placeholder {
		color: var(--gray-text);
		opacity: 0.7;
	}

	.search-input:focus {
		border-color: var(--blue);
		outline: none;
		box-shadow: 0 0 0 2px rgba(26, 86, 219, 0.2);
	}

	.icon {
		position: absolute;
		right: 10px;
		width: 20px;
		height: 20px;
		color: var(--gray-text);
		pointer-events: none;
		opacity: 0.5;
	}
</style>
