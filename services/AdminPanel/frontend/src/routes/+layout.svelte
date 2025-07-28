<script>
	import { loadCollections } from '$lib/stores/db.js';
	import { onMount } from 'svelte';
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
			icon: 'cog',
			items: [
				{ text: 'Сообщения', link: '/messages', icon: 'messages' },
				{ text: 'Кнопки', link: '/buttons', icon: 'circle-plus' },
				{ text: 'Тригеры', link: '/trigers', icon: 'fire' },
				{ text: 'Переменные', link: '/variables', icon: 'terminal' },
				{ text: 'Клавиатура', link: '/keyboards', icon: 'terminal' }
			]
		},
		{
			header: 'Рассылка',
			icon: 'paper-plane',
			items: [{ text: 'Рассылка', link: '/newsletter', icon: 'envelope-open' }]
		},
		{
			header: 'Статистика',
			icon: 'chart-pie',
			items: [
				{ text: 'Тригеры', link: '/statistic/trigers', icon: 'bell-ring' },
				{ text: 'Пользователи', link: '/statistic/users', icon: 'briefcase' }
			]
		},
		{
			header: 'Управление',
			icon: 'adjustments-vertical',
			items: [
				{ text: 'Пользователи', link: '/users', icon: 'desktop-pc' },
				{ text: 'Иконки', link: '/icones', icon: 'palette' },
				{ text: 'Картинки', link: '/images', icon: 'image' }
			]
		}
	];
</script>

<div class="wrap">
	<nav>
	</nav>

	<SideBar {config} />
	<div class="window">
		<slot />
	</div>
</div>

<style>
	:global(html),
	:global(body) {
		margin: 0;
		padding: 0;
		height: 100%;
		overflow: hidden;
	}

	.wrap {
		display: grid;
		grid-template-columns: 300px 1fr;
		grid-template-rows: max-content 1fr;
		background: var(--first-color);
		height: 100vh;
	}
	nav {
		display: flex;
		gap: 1rem;
		padding: 1rem;
		background: var(--first-color);
		grid-column: 1 / -1;
		grid-row: 1 / 2;
	}
	:global(.side-bar-container) {
		grid-column: 1 / 2;
		grid-row: 2 / 3;
		overflow-y: auto;
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
		grid-column: 2 / 3;
		grid-row: 2 / 3;
		overflow-y: auto;
	}
</style>
