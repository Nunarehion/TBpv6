<script>
	import { onMount } from 'svelte';
	import {
		collections,
		loadCollections,
		sendingBroadcast,
		error,
		sendBroadcast,
		selectedCollection,
		documents,
		loadDocuments
	} from '$lib/stores/db.js';

	let selectedMessageName = $state('');
	let broadcastStatusMessage = $state('');

	onMount(() => {
		loadCollections();
		loadDocuments('message');
	});

	$effect(() => {
		if ($sendingBroadcast) {
			broadcastStatusMessage = 'Рассылка запускается...';
		} else if ($error) {
			broadcastStatusMessage = `Ошибка: ${$error}`;
		} else {
			broadcastStatusMessage = '';
		}
	});

	async function handleSendBroadcast() {
		if (!selectedMessageName) {
			alert('Пожалуйста, выберите сообщение для рассылки.');
			return;
		}
		broadcastStatusMessage = '';
		try {
			await sendBroadcast(selectedMessageName);
			broadcastStatusMessage = `Рассылка сообщения "${selectedMessageName}" успешно запущена!`;
			selectedMessageName = '';
		} catch (e) {}
	}

	let messageCollections = $derived.by(() => $collections.filter((name) => name === 'message'));
</script>

<main>
	<h1>Панель управления рассылками</h1>

	<div class="broadcast-section">
		<h2>Запустить новую рассылку</h2>
		<div class="form-group">
			<label for="message-select">Выберите сообщение:</label>
			<select id="message-select" bind:value={selectedMessageName}>
				<option value="">-- Выберите сообщение --</option>
				{#each $documents as doc (doc._id)}
					{#if $selectedCollection === 'message'}
						<option value={doc.name}>{doc.name}</option>
					{/if}
				{/each}
			</select>
		</div>

		<button
			on:click={handleSendBroadcast}
			disabled={!selectedMessageName || $sendingBroadcast}
			class="broadcast-button"
		>
			{#if $sendingBroadcast}
				Запуск рассылки...
			{:else}
				Запустить рассылку
			{/if}
		</button>

		{#if broadcastStatusMessage}
			<p class="status-message" class:error-message={$error}>
				{broadcastStatusMessage}
			</p>
		{/if}
	</div>

	<hr />
</main>

<style>
	:root {
		--first-color: #1f2a37;
		--second-color: #374151;
		--border-gray: #4b556399;
		--gray-text: #9ca3af;
		--main-text: #ffffff;
		--decor-green: #0e9f6e;
		--decor-red: #e23939;
		--blue: #1a56db;
		--blue-dark: #164eaf;
	}

	body {
		background-color: var(--first-color);
		color: var(--main-text);
	}

	main {
		padding: 2rem;
		font-family: 'Inter', sans-serif;
		background-color: var(--first-color);
		min-height: 100vh;
		color: var(--main-text);
	}

	h1,
	h2 {
		color: var(--gray-text);
		margin-bottom: 1.5rem;
	}

	.broadcast-section {
		background-color: var(--second-color);
		padding: 2rem;
		border-radius: 10px;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
		margin-bottom: 2rem;
		border: 1px solid var(--border-gray);
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: bold;
		color: var(--gray-text);
	}

	select {
		width: 100%;
		padding: 0.8rem;
		border: 1px solid var(--border-gray);
		border-radius: 5px;
		font-size: 1rem;
		background-color: var(--first-color);
		color: var(--main-text);
		box-sizing: border-box;
	}

	.broadcast-button {
		padding: 0.8rem 1.5rem;
		background-color: var(--blue);
		color: var(--main-text);
		border: none;
		border-radius: 5px;
		font-size: 1rem;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.broadcast-button:hover:not(:disabled) {
		background-color: var(--blue-dark);
	}

	.broadcast-button:disabled {
		background-color: #4b5563;
		cursor: not-allowed;
		opacity: 0.7;
	}

	.status-message {
		margin-top: 1rem;
		padding: 0.8rem;
		border-radius: 5px;
		background-color: var(--second-color);
		color: var(--main-text);
		text-align: center;
		border: 1px solid var(--border-gray);
	}

	.error-message {
		background-color: #631c26;
		color: var(--main-text);
		border: 1px solid var(--decor-red);
	}

	hr {
		border: 0;
		border-top: 1px solid var(--border-gray);
		margin: 2rem 0;
	}

	.go-to-data-button {
		padding: 0.8rem 1.5rem;
		background-color: var(--second-color);
		color: var(--main-text);
		border: 1px solid var(--border-gray);
		border-radius: 5px;
		font-size: 1rem;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.go-to-data-button:hover {
		background-color: #4b5563;
	}
</style>
