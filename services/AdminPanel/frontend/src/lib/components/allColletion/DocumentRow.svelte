<script>
	import { createEventDispatcher } from 'svelte';
	import DocumentEditModal from './DocumentEditModal.svelte'; // Импортируем модальное окно редактирования

	let { doc, columns = [], editingId = null } = $props();

	const dispatch = createEventDispatcher();

	let showDeleteConfirm = $state(false); // Состояние для модального окна подтверждения удаления
	let showEditModal = $state(false); // Состояние для модального окна редактирования

	// isEditing используется для управления видимостью чекбокса,
	// но логика редактирования теперь полностью в модальном окне.
	let isEditing = $derived(doc && editingId === doc._id);

	function confirmDelete() {
		showDeleteConfirm = true;
	}

	function cancelDelete() {
		showDeleteConfirm = false;
	}

	function executeDelete() {
		dispatch('delete', doc);
		showDeleteConfirm = false;
	}

	function startEdit() {
		showEditModal = true; // Открываем модальное окно редактирования
	}

	// Обработчики событий из DocumentEditModal
	function onModalSave(event) {
		dispatch('save', event.detail); // Отправляем событие сохранения родителю
		showEditModal = false; // Закрываем модальное окно
	}

	function onModalCancel() {
		showEditModal = false; // Закрываем модальное окно
	}
</script>

{#if doc}
	<tr class="table-row">
		<td class="table-cell select-cell">
			{#if !isEditing}
				<input type="checkbox" />
			{/if}
		</td>
		{#each columns as col}
			<td class="table-cell" class:name-text={col.trim() === 'name'}>
				<!-- Здесь только отображение данных, редактирование происходит в модальном окне -->
				{#if col.trim() === 'text'}
					<span title={doc[col]}>
						{doc[col]?.length > 15 ? doc[col].slice(0, 15) + '…' : (doc[col] ?? '-')}
					</span>
				{:else if col === '_id'}
					{typeof doc[col] === 'string' ? '…' + doc[col].slice(-5) : doc[col]}
				{:else}
					{doc[col] ?? '-'}
				{/if}
			</td>
		{/each}
		<td class="table-cell actions-cell">
			<button on:click={startEdit} aria-label="Редактировать" class="action-button edit-button">
				<svg class="icon"><use href="/sprite.svg#pen"></use></svg>
			</button>
			<button on:click={confirmDelete} aria-label="Удалить" class="action-button delete-button">
				<svg class="icon"><use href="/sprite.svg#trash-bin"></use></svg>
			</button>
		</td>
	</tr>

	<!-- Модальное окно подтверждения удаления -->
	{#if showDeleteConfirm}
		<div class="modal-overlay">
			<div class="modal-content">
				<h3>Подтверждение удаления</h3>
				<p>Вы уверены, что хотите удалить этот документ?</p>
				<div class="modal-actions">
					<button on:click={executeDelete} class="action-button delete-button">Удалить</button>
					<button on:click={cancelDelete} class="action-button cancel-button">Отмена</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Модальное окно редактирования -->
	{#if showEditModal}
		<DocumentEditModal {doc} {columns} on:save={onModalSave} on:cancel={onModalCancel} />
	{/if}
{/if}

<style>

	.table-row {
		border-bottom: 1px solid var(--border-gray);
		background-color: var(--first-color);
	}

	.table-row:hover {
		background-color: var(--hover-color);
	}

	.table-cell {
		padding: 0.8rem 1rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: var(--text-color);
		vertical-align: middle;
	}

	.select-cell {
		width: 40px;
		text-align: center;
	}

	.actions-cell {
		width: auto;
		text-align: right;
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
		align-items: center;
		padding-right: 1rem;
	}

	.action-button {
		padding: 0.4rem 0.8rem;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		font-size: 0.85rem;
		transition: background-color 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.edit-button {
		background-color: #007acc;
		color: white;
	}

	.edit-button:hover {
		background-color: #005fa3;
	}

	.delete-button {
		background-color: #dc3545;
		color: white;
	}

	.delete-button:hover {
		background-color: #c82333;
	}

	.icon {
		width: 1.2rem;
		height: 1.2rem;
		fill: currentColor;
	}

	/* Стили для модальных окон (общие для подтверждения удаления и редактирования) */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000; /* Убедитесь, что это значение выше, чем у других элементов */
	}

	.modal-content {
		background-color: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		text-align: center;
		color: black;
	}

	.modal-actions {
		margin-top: 1.5rem;
		display: flex;
		justify-content: center;
		gap: 1rem;
	}
</style>
