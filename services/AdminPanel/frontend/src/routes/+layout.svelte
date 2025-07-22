<script>
	import { onMount } from 'svelte';
	import { loadCollections } from '$lib/stores/db.js';
	import '$lib/reset.css';
	import '$lib/fonts.css';
	import '$lib/global.css';

	onMount(() => {
		loadCollections();
	});

	import SideBar from '$lib/components/SideBar.svelte';
	let name = 'world';
	let config = [
		{
			header: 'Конструктор',
			icon: 'database',
			items: [
				{ text: 'Сообщения', link: '/messages' },
				{ text: 'Кнопки', link: 'buttons' },
				{ text: 'Тригеры', link: 'trigers' }
			]
		},
		{ header: 'About', link: '', items: [2, 3, 4] }
	];
</script>

<div class="wrap">
	<nav>
		<a href="/all">все</a>
		<a href="/messages">сообщения</a>
		<a href="/icones">иконки</a>
	</nav>

	<SideBar {config} />
	<div class="window">
		<slot />
	</div>
</div>

<style>
	.wrap {
		display: grid;
		grid-template-columns: 245px 1fr;
		grid-template-rows: max-content 1fr;
		background: var(--first-color);
	}
	nav {
		display: flex;
		gap: 1rem;
		padding: 1rem;
		background: var(--first-color);
		grid-column: 1 / -1;
		grid-row: 1 / 3;
	}
	a {
		text-decoration: none;
		color: #007acc;
		font-weight: bold;
	}
	a:hover {
		text-decoration: underline;
	}
	.window {
		padding: 2rem;
		background-color: #1e2630;
		border: 1px solid var(--border-gray);
	}
</style>
