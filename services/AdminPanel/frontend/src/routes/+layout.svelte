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
			icon: 'database',
			items: [
				{ text: 'Сообщения', link: '/messages' }, // Изменено
				{ text: 'Кнопки', link: '/buttons' }, // Изменено
				{ text: 'Тригеры', link: '/trigers' }, // Изменено
				{ text: 'Переменные', link: '/variables' } // Изменено
			]
		},
		{
			header: 'Статистика',
			icon: 'database',
			items: [
				{ text: 'Тригеры', link: '/statistic/trigers' }, // Уже было правильно, если это полный путь
				{ text: 'Пользователи', link: '/statistic/users' } // Уже было правильно, если это полный путь
			]
		},
		{
			header: 'Общее',
			icon: 'database',
			items: [
				{ text: 'Пользователи', link: '/users' }, // Изменено
				{ text: 'Картинки', link: '/buttons' }, // Изменено
				{ text: 'Цены', link: '/trigers' } // Изменено
			]
		}
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
