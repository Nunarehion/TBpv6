<script>
	import { invalidateAll } from '$app/navigation';
	import { applyAction, deserialize } from '$app/forms';

	let form;
	const handleSubmit = async (e) => {
		form = e.target;
		const response = await fetch('/auth/register', {
			method: 'POST',
			body: new FormData(form)
		});
		const result = deserialize(await response.text());
		await applyAction(result);
		invalidateAll();
	};
</script>

<h1>Регистрация</h1>
<form method="POST" on:submit|preventDefault={handleSubmit}>
	<label for="username">Имя пользователя:</label>
	<input type="text" id="username" name="username" required />

	<label for="password">Пароль:</label>
	<input type="password" id="password" name="password" required />

	<button type="submit">Зарегистрироваться</button>
</form>


