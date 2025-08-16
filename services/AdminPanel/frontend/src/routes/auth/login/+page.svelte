<script>
	import { goto } from '$app/navigation';
	import '$lib/reset.css';
	import '$lib/fonts.css';
	import '$lib/global.css';
	async function handleFormSubmit(event) {
		event.preventDefault();

		const form = event.currentTarget;
		const formData = new FormData(form);

		try {
			const response = await fetch(form.action, {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				goto('/');
			} else {
				const result = await response.json();
				alert(result.message || 'Произошла ошибка входа.');
			}
		} catch (error) {
			alert('Произошла сетевая ошибка: ' + error.message);
		}
	}
</script>

<div class="container">
	<div class="card">
		<h2>Вход</h2>
		<form on:submit|preventDefault={handleFormSubmit} method="POST">
			<div class="field">
				<label for="username">Логин</label>
				<input id="username" name="username" type="text" placeholder="Введите логин" />
			</div>
			<div class="field">
				<label for="password">Пароль</label>
				<input id="password" name="password" type="password" placeholder="Введите пароль" />
			</div>

			<div class="card-footer actions">
				<button type="submit">Войти</button>
			</div>
		</form>
	</div>
</div>

<style>
	.container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		width: 100%;
	}

	.card {
		background: var(--first-color);
		border: 1px solid var(--border-gray);
		border-radius: 0.5rem;
		padding: 2rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		max-width: 400px;
		width: 100%;
	}

	.card h2 {
		text-align: center;
		color: var(--main-text);
		margin-bottom: 1.5rem;
		font-size: 1.5rem;
	}

	.card form {
		display: flex;
		flex-direction: column;
	}

	.field {
		margin-bottom: 1rem;
		display: flex;
		flex-direction: column;
	}

	label {
		font-weight: 500;
		margin-bottom: 0.25rem;
		color: var(--gray-text);
	}

	input {
		padding: 0.75rem 1rem;
		border: 1px solid var(--border-gray);
		border-radius: 0.25rem;
		background-color: var(--second-color);
		color: var(--main-text);
		width: 100%;
		box-sizing: border-box;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
		justify-content: flex-end;
	}

	.card-footer {
		margin-top: auto;
	}

	button {
		padding: 0.75rem 1rem;
		border: none;
		border-radius: 0.375rem;
		background-color: var(--blue);
		color: white;
		cursor: pointer;
		font-size: 0.9rem;
		transition: background-color 0.2s ease;
	}

	button:hover:not(:disabled) {
		background-color: #1a56db;
	}

	button:disabled {
		background-color: var(--border-gray);
		cursor: not-allowed;
		opacity: 0.6;
	}
</style>
