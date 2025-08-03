<script>
	import { createEventDispatcher } from 'svelte';

	let { doc, columns } = $props();
	const dispatch = createEventDispatcher();

	let localDoc = $state(JSON.parse(JSON.stringify(doc)));

	function saveChanges() {
		dispatch('save', localDoc);
	}

	function cancelEdit() {
		dispatch('cancel');
	}
</script>

<div class="modal-overlay">
	<div class="modal-content">
		<h3>Редактировать документ</h3>
		<form on:submit|preventDefault={saveChanges}>
			{#each columns as col}
				{#if col !== '_id' && col !== 'created_at' && col !== 'updated_at'}
					<div class="form-group">
						<label for={`edit-${col}`}>{col}:</label>
						<input type="text" id={`edit-${col}`} bind:value={localDoc[col]} class="form-input" />
					</div>
				{/if}
			{/each}
			<div class="modal-actions">
				<button type="submit" class="action-button save-button">Сохранить</button>
				<button type="button" on:click={cancelEdit} class="action-button cancel-button"
					>Отмена</button
				>
			</div>
		</form>
	</div>
</div>

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.6);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 2000;
	}

	.modal-content {
		background-color: var(--first-color);
		padding: 2rem;
		border-radius: 10px;
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
		max-width: 500px;
		width: 90%;
		color: var(--text-color);
	}

	h3 {
		color: var(--gray-text);
		margin-top: 0;
		margin-bottom: 1.5rem;
		text-align: center;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: bold;
		color: var(--gray-text);
	}

	.form-input {
		width: 100%;
		padding: 0.8rem;
		border: 1px solid var(--border-gray);
		border-radius: 5px;
		background-color: var(--second-color);
		color: var(--text-color);
		box-sizing: border-box;
	}

	.form-input.readonly {
		background-color: #e0e0e0;
		cursor: not-allowed;
	}

	.modal-actions {
		margin-top: 2rem;
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
	}

	.action-button {
		padding: 0.7rem 1.5rem;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		font-size: 1rem;
		transition: background-color 0.2s ease;
		color: white;
	}

	.save-button {
		background-color: #28a745;
	}

	.save-button:hover {
		background-color: #218838;
	}

	.cancel-button {
		background-color: #6c757d;
	}

	.cancel-button:hover {
		background-color: #5a6268;
	}
</style>
