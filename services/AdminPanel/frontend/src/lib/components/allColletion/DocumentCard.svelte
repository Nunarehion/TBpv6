<script>
	import { createEventDispatcher } from 'svelte';

	export let doc;
	const dispatch = createEventDispatcher();

	let localDoc = structuredClone(doc);
	let expanded = false;
	let saving = false;

	async function handleSave() {
		saving = true;
		dispatch('save', localDoc);
		saving = false;
	}

	function handleCancel() {
		localDoc = structuredClone(doc);
		dispatch('cancel');
	}
</script>

<div class="card">
	<form on:submit|preventDefault={handleSave}>
		{#each Object.entries(localDoc) as [key, value]}
			<div class="field">
				<label for={'field-' + key}>{key}</label>
				<input
					id={'field-' + key}
					type="text"
					bind:value={localDoc[key]}
					readonly={key === '_id'}
				/>
			</div>
		{/each}

		<div class="card-footer actions">
			<button type="submit" disabled={saving}>💾 Сохранить</button>
			<button type="button" on:click={handleCancel} disabled={saving}>Отмена</button>
			<button type="button" on:click={() => (expanded = !expanded)}>
				{expanded ? '▲ Скрыть JSON' : '▼ Показать JSON'}
			</button>
		</div>
	</form>

	{#if expanded}
		<pre class="json">{JSON.stringify(doc, null, 2)}</pre>
	{/if}
</div>

<style>
	.card form {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.field {
		margin-bottom: 0.75rem;
		display: flex;
		flex-direction: column;
	}

	label {
		font-weight: 500;
		margin-bottom: 0.25rem;
		color: var(--gray-text, #444);
		margin-top: 0.5rem;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
		justify-content: flex-end;
	}

	.json {
		background: #f8f8f8;
		padding: 1rem;
		margin-top: 1rem;
		border-radius: 0.5rem;
		font-size: 0.85rem;
		color: #333;
		white-space: pre-wrap;
		word-break: break-all;
	}
	.card-footer {
		margin-top: auto;
	}
</style>
