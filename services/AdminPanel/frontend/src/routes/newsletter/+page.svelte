<script>
	import { onMount } from 'svelte'; // Удалены импорты 'effect' и 'derived'
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
		// Используем $effect как руну
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
			selectedName = '';
		} catch (e) {}
	}

	// Используем $derived.by как руну
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

	<h2>Управление данными</h2>
	<p>
		Для управления сообщениями и другими данными перейдите в соответствующий раздел. Убедитесь, что
		в коллекции "message" есть сообщения с уникальными именами.
	</p>
	<button on:click={() => (window.location.href = '/')} class="go-to-data-button">
		Перейти к данным
	</button>
</main>

<style>
	main {
		padding: 2rem;
		font-family: 'Inter', sans-serif;
		background-color: #f8f9fa;
		min-height: 100vh;
		color: #333;
	}

	h1,
	h2 {
		color: #2c3e50;
		margin-bottom: 1.5rem;
	}

	.broadcast-section {
		background-color: #ffffff;
		padding: 2rem;
		border-radius: 10px;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: bold;
		color: #555;
	}

	select {
		width: 100%;
		padding: 0.8rem;
		border: 1px solid #ced4da;
		border-radius: 5px;
		font-size: 1rem;
		background-color: #f0f2f5;
		box-sizing: border-box;
	}

	.broadcast-button {
		padding: 0.8rem 1.5rem;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 5px;
		font-size: 1rem;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.broadcast-button:hover:not(:disabled) {
		background-color: #0056b3;
	}

	.broadcast-button:disabled {
		background-color: #a0c8f5;
		cursor: not-allowed;
	}

	.status-message {
		margin-top: 1rem;
		padding: 0.8rem;
		border-radius: 5px;
		background-color: #e9ecef;
		color: #333;
		text-align: center;
	}

	.error-message {
		background-color: #f8d7da;
		color: #721c24;
		border: 1px solid #f5c6cb;
	}

	hr {
		border: 0;
		border-top: 1px solid #eee;
		margin: 2rem 0;
	}

	.go-to-data-button {
		padding: 0.8rem 1.5rem;
		background-color: #6c757d;
		color: white;
		border: none;
		border-radius: 5px;
		font-size: 1rem;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.go-to-data-button:hover {
		background-color: #5a6268;
	}
</style>
