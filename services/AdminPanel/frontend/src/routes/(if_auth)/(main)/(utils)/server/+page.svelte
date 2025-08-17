<script>
	import { onMount, onDestroy } from 'svelte';
	import { writable } from 'svelte/store';

	const serverInfo = writable({
		cpuLoad: '...',
		ram: {
			totalMemory: '...',
			usedMemory: '...',
			usedMemoryPercent: '...'
		},
		disk: {
			totalDisk: '...',
			usedDisk: '...',
			usedDiskPercent: '...'
		}
	});
	const isLoading = writable(true);
	const fetchError = writable(null);
	let intervalId;

	async function fetchServerInfo() {
		try {
			const res = await fetch('/api/server');
			if (!res.ok) {
				throw new Error(`HTTP error! Status: ${res.status}`);
			}
			const data = await res.json();
			serverInfo.set(data);
			fetchError.set(null);
		} catch (e) {
			console.error('Failed to fetch server info:', e);
			fetchError.set('Не удалось получить данные о сервере.');
		} finally {
			isLoading.set(false);
		}
	}

	onMount(() => {
		fetchServerInfo();
		intervalId = setInterval(fetchServerInfo, 3000);
	});

	onDestroy(() => {
		clearInterval(intervalId);
	});

	import { goto } from '$app/navigation';
	async function handleLogout() {
		await fetch('/logout', {
			method: 'POST'
		});
		goto('/auth/login');
	}
</script>

<div class="server-info-container">
	<h1>Информация о сервере</h1>
	<nav>
		<button on:click={handleLogout}>Выйти из акакунта</button>
	</nav>

	{#if $fetchError}
		<p class="error-message">{$fetchError}</p>
	{:else if $isLoading}
		<p>Загрузка данных...</p>
	{:else}
		<div class="metrics-grid">
			<div class="metric-card">
				<h3>Нагрузка на CPU</h3>
				<p class="metric-value">{$serverInfo.cpuLoad}%</p>
			</div>
			<div class="metric-card">
				<h3>Оперативная память (RAM)</h3>
				<p class="metric-value">{$serverInfo.ram.usedMemoryPercent}%</p>
				<p class="metric-details">
					{$serverInfo.ram.usedMemory} GB / {$serverInfo.ram.totalMemory} GB
				</p>
			</div>
			<div class="metric-card">
				<h3>Дисковое пространство</h3>
				<p class="metric-value">{$serverInfo.disk.usedDiskPercent}%</p>
				<p class="metric-details">
					{$serverInfo.disk.usedDisk} GB / {$serverInfo.disk.totalDisk} GB
				</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.server-info-container {
		padding: 2rem;
		max-width: 800px;
		margin: auto;
	}
	h1 {
		color: #fff;
		text-align: center;
	}
	.metrics-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}
	.metric-card {
		background-color: var(--first-color);
		border: 1px solid var(--border-gray);
		border-radius: 8px;
		padding: 1.5rem;
		text-align: center;
	}
	.metric-card h3 {
		color: #a0aec0;
		font-size: 1rem;
		margin-bottom: 0.5rem;
	}
	.metric-value {
		font-size: 2.5rem;
		font-weight: bold;
		color: #3b82f6;
		margin-bottom: 0.25rem;
	}
	.metric-details {
		font-size: 0.9rem;
		color: var(--gray-text);
	}
	.error-message {
		color: #ef4444;
		text-align: center;
		font-size: 1.1rem;
	}
	nav {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		padding-top: 0;
	}
</style>
