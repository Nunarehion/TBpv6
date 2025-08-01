<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    let selectedMessageName = $state('');
    let broadcastStatusMessage = $state('');
    let sendingBroadcast = $state(false); // Local state for loading/sending status
    let apiError = $state(null); // Local state for API errors

    const messages = writable([]); // To store documents from the 'message' collection

    async function loadMessages() {
        try {
            const response = await fetch('/api/message'); // Assuming 'message' is the collection name
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to fetch messages: ${response.status}`);
            }
            const data = await response.json();
            messages.set(data);
        } catch (error) {
            console.error('Error loading messages:', error);
            apiError = error.message;
            messages.set([]);
        }
    }

    onMount(() => {
        loadMessages();
    });

    $effect(() => {
        if (sendingBroadcast) {
            broadcastStatusMessage = 'Рассылка запускается...';
            apiError = null; // Clear previous errors when starting new broadcast
        } else if (apiError) {
            broadcastStatusMessage = `Ошибка: ${apiError}`;
        } else {
            broadcastStatusMessage = '';
        }
    });

    async function handleSendBroadcast() {
        if (!selectedMessageName) {
            alert('Пожалуйста, выберите сообщение для рассылки.');
            return;
        }

        sendingBroadcast = true;
        apiError = null; // Clear previous errors
        broadcastStatusMessage = 'Отправка запроса на рассылку...';

        try {
            const response = await fetch('/api/broadcast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message_name: selectedMessageName }),
            });

            if (!response.ok) {
                const errorData = await response.json(); // Attempt to parse error JSON
                throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            broadcastStatusMessage = result.message || `Рассылка сообщения "${selectedMessageName}" успешно запущена!`;
            selectedMessageName = ''; // Clear selection on success
        } catch (e) {
            console.error('Error sending broadcast:', e);
            apiError = e.message;
            broadcastStatusMessage = `Ошибка: ${e.message}`; // Set detailed error message
        } finally {
            sendingBroadcast = false;
        }
    }
</script>

<main>
    <h1>Панель управления рассылками</h1>

    <div class="broadcast-section">
        <h2>Запустить новую рассылку</h2>
        <div class="form-group">
            <label for="message-select">Выберите сообщение:</label>
            <select id="message-select" bind:value={selectedMessageName}>
                <option value="">-- Выберите сообщение --</option>
                {#each $messages as doc (doc._id)}
                    <option value={doc.name}>{doc.name}</option>
                {/each}
            </select>
        </div>

        <button
            on:click={handleSendBroadcast}
            disabled={!selectedMessageName || sendingBroadcast}
            class="broadcast-button"
        >
            {#if sendingBroadcast}
                Запуск рассылки...
            {:else}
                Запустить рассылку
            {/if}
        </button>

        {#if broadcastStatusMessage}
            <p class="status-message" class:error-message={!!apiError}>
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