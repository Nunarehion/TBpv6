<script>
	import { createEventDispatcher } from 'svelte';
	import { slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	let { doc, columns = [] } = $props();

	const dispatch = createEventDispatcher();
	let editableDoc = $state({
		...doc,
		name: doc.name || `keyboard_${Math.random().toString(36).substring(2, 9)}`,
		buttons:
			doc.buttons && Array.isArray(doc.buttons)
				? doc.buttons.map((row) =>
						Array.isArray(row)
							? row
									.filter((btn) => btn && typeof btn === 'object' && btn.id)
									.map((btn) => ({ id: btn.id }))
							: []
					)
				: [],
		created_at: doc.created_at || new Date().toISOString()
	});
	function formatDate(dateString) {
		if (!dateString) return 'Дата не указана';
		const date = new Date(dateString);
		const options = {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		};
		return date.toLocaleDateString('ru-RU', options);
	}

	let draggedButton = $state(null);
	let draggedButtonSourceRow = $state(null);
	let draggedButtonSourceIndex = $state(null);
	let draggedButtonIsNew = $state(false);

	let availableButtons = $state([]);
	let loadingAvailableButtons = $state(true);
	let errorAvailableButtons = $state(null);

	let newButtonText = $state('');
	let newButtonCallbackData = $state('');
	let creatingNewButton = $state(false);
	let newButtonError = $state(null);
	let touchButtonClone = $state(null);
	let touchMoveTarget = $state(null);
	let touchSourceRect = $state(null);

	async function fetchAvailableButtons() {
		loadingAvailableButtons = true;
		errorAvailableButtons = null;
		try {
			const response = await fetch('/api/buttons');
			if (!response.ok) {
				throw new Error(`Failed to fetch 'buttons' buttons: ${response.statusText}`);
			}
			const data = await response.json();

			availableButtons = data.map((buttonDoc) => ({
				id: buttonDoc._id,
				text:
					buttonDoc.text ||
					buttonDoc.label ||
					buttonDoc.name ||
					`Кнопка ${String(buttonDoc._id).slice(-4)}`,
				callback_data: buttonDoc.callback_data || ''
			}));
		} catch (error) {
			errorAvailableButtons = error.message;
		} finally {
			loadingAvailableButtons = false;
		}
	}

	onMount(async () => {
		await fetchAvailableButtons();
	});
	function getButtonData(buttonId) {
		const button = availableButtons.find((b) => b.id === buttonId);
		return {
			text: button ? button.text : 'Нет текста',
			callback_data: button ? button.callback_data : 'Нет данных'
		};
	}

	function handleInput(field, event) {
		editableDoc = { ...editableDoc, [field]: event.target.value };
	}

	function handleMoveStart(button, rowIdx, btnIdx, isNew, rect) {
		draggedButton = button;
		draggedButtonSourceRow = rowIdx;
		draggedButtonSourceIndex = btnIdx;
		draggedButtonIsNew = isNew;
		touchSourceRect = rect;
	}

	function handleDragStart(event, button, rowIdx = -1, btnIdx = -1, isNew = false) {
		handleMoveStart(button, rowIdx, btnIdx, isNew, event.target.getBoundingClientRect());
		event.dataTransfer.effectAllowed = 'move';
	}

	function handleTouchStart(event, button, rowIdx = -1, btnIdx = -1, isNew = false) {
		if (event.target.closest('.remove-button')) {
			removeButton(rowIdx, btnIdx);
			return;
		}

		if (event.target.closest('.add-to-new-row-button')) {
			addAvailableButtonToNewRow(button);
			return;
		}

		if (event.target.closest('button') && !event.target.closest('.keyboard-button')) {
			return;
		}

		let touchStartX = event.touches[0].clientX;
		let touchStartY = event.touches[0].clientY;
		let isDragging = false;
		const handleTapMove = (moveEvent) => {
			const moveX = moveEvent.touches[0].clientX;
			const moveY = moveEvent.touches[0].clientY;
			if (Math.abs(moveX - touchStartX) > 5 || Math.abs(moveY - touchStartY) > 5) {
				isDragging = true;
				event.preventDefault();

				const target = event.currentTarget;
				const rect = target.getBoundingClientRect();

				handleMoveStart(button, rowIdx, btnIdx, isNew, rect);

				touchButtonClone = target.cloneNode(true);
				document.body.appendChild(touchButtonClone);
				Object.assign(touchButtonClone.style, {
					position: 'absolute',
					left: `${rect.left}px`,
					top: `${rect.top}px`,
					width: `${rect.width}px`,
					height: `${rect.height}px`,
					pointerEvents: 'none',
					zIndex: '1001',
					opacity: '0.8',
					transform: 'scale(1.1)'
				});

				handleTouchMove(moveEvent);

				document.removeEventListener('touchmove', handleTapMove);
			}
		};
		const handleTapEnd = (endEvent) => {
			document.removeEventListener('touchmove', handleTapMove);
			document.removeEventListener('touchend', handleTapEnd);

			if (isDragging) {
				handleMoveEnd(endEvent);
			}
		};

		document.addEventListener('touchmove', handleTapMove);
		document.addEventListener('touchend', handleTapEnd);
	}

	function handleTouchMove(event) {
		if (!touchButtonClone) return;

		event.preventDefault();
		const touch = event.touches[0];
		touchButtonClone.style.left = `${touch.pageX - touchButtonClone.offsetWidth / 2}px`;
		touchButtonClone.style.top = `${touch.pageY - touchButtonClone.offsetHeight / 2}px`;

		const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
		touchMoveTarget = targetElement;
	}

	function handleMoveEnd(event) {
		if (!draggedButton) return;
		const touch = event.changedTouches[0];
		const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);

		if (targetElement) {
			if (targetElement.closest('.available-buttons-list')) {
				handleDropOnAvailableButtons({ preventDefault: () => {} });
			} else if (targetElement.closest('.add-row-drop-zone')) {
				handleDropOnAddRow({ preventDefault: () => {} });
			} else {
				const dropTargetBtn = targetElement.closest('.keyboard-button');
				const dropTargetRow = targetElement.closest('.button-row');
				if (dropTargetBtn) {
					const dropTargetBtnWrapper = dropTargetBtn.parentNode;
					const rowIdx = Array.from(dropTargetBtnWrapper.parentNode.children).indexOf(
						dropTargetBtnWrapper
					);
					const btnIdx = Array.from(dropTargetBtnWrapper.children).indexOf(dropTargetBtn);
					handleDrop({ preventDefault: () => {} }, rowIdx, btnIdx);
				} else if (dropTargetRow) {
					const rowIdx = Array.from(dropTargetRow.parentNode.children).indexOf(dropTargetRow);
					handleDrop({ preventDefault: () => {} }, rowIdx, -1);
				}
			}
		}

		if (touchButtonClone) {
			document.body.removeChild(touchButtonClone);
			touchButtonClone = null;
			touchMoveTarget = null;
		}

		draggedButton = null;
		draggedButtonSourceRow = null;
		draggedButtonSourceIndex = null;
		draggedButtonIsNew = false;
		touchSourceRect = null;
	}

	function handleDragOver(event) {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	}

	function handleDrop(event, targetRowIdx, targetBtnIdx = -1) {
		event.preventDefault();
		if (!draggedButton) return;

		let newButtons = JSON.parse(JSON.stringify(editableDoc.buttons));
		const buttonToAdd = { id: draggedButton.id };

		let sourceRowWasRemoved = false;
		let originalDraggedButtonSourceRow = draggedButtonSourceRow;
		if (!draggedButtonIsNew && draggedButtonSourceRow !== -1 && draggedButtonSourceIndex !== -1) {
			if (
				newButtons[draggedButtonSourceRow] &&
				newButtons[draggedButtonSourceRow][draggedButtonSourceIndex] !== undefined
			) {
				newButtons[draggedButtonSourceRow].splice(draggedButtonSourceIndex, 1);
				if (newButtons[draggedButtonSourceRow].length === 0) {
					newButtons.splice(draggedButtonSourceRow, 1);
					sourceRowWasRemoved = true;
				}
			}
		}

		if (sourceRowWasRemoved && originalDraggedButtonSourceRow < targetRowIdx) {
			targetRowIdx--;
		}

		if (targetRowIdx === -1) {
			newButtons.push([buttonToAdd]);
		} else {
			if (newButtons[targetRowIdx] === undefined) {
				if (targetRowIdx >= 0 && targetRowIdx <= newButtons.length) {
					newButtons.splice(targetRowIdx, 0, []);
				} else {
					newButtons.push([]);
					targetRowIdx = newButtons.length - 1;
				}
			}

			if (targetBtnIdx === -1) {
				newButtons[targetRowIdx].push(buttonToAdd);
			} else {
				if (targetBtnIdx >= 0 && targetBtnIdx <= newButtons[targetRowIdx].length) {
					newButtons[targetRowIdx].splice(targetBtnIdx, 0, buttonToAdd);
				} else {
					newButtons[targetRowIdx].push(buttonToAdd);
				}
			}
		}

		editableDoc.buttons = newButtons;
		draggedButton = null;
		draggedButtonSourceRow = null;
		draggedButtonSourceIndex = null;
		draggedButtonIsNew = false;
	}

	function handleDropOnAddRow(event) {
		event.preventDefault();
		if (!draggedButton) return;
		let newButtons = JSON.parse(JSON.stringify(editableDoc.buttons));
		const buttonToAdd = { id: draggedButton.id };
		if (!draggedButtonIsNew && draggedButtonSourceRow !== -1 && draggedButtonSourceIndex !== -1) {
			if (
				newButtons[draggedButtonSourceRow] &&
				newButtons[draggedButtonSourceRow][draggedButtonSourceIndex] !== undefined
			) {
				newButtons[draggedButtonSourceRow].splice(draggedButtonSourceIndex, 1);
				if (newButtons[draggedButtonSourceRow].length === 0) {
					newButtons.splice(draggedButtonSourceRow, 1);
				}
			}
		}

		newButtons.push([buttonToAdd]);
		editableDoc.buttons = newButtons;

		draggedButton = null;
		draggedButtonSourceRow = null;
		draggedButtonSourceIndex = null;
		draggedButtonIsNew = false;
	}

	function handleDropOnAvailableButtons(event) {
		event.preventDefault();
		if (!draggedButton || draggedButtonIsNew || draggedButtonSourceRow === -1) return;

		let newButtons = JSON.parse(JSON.stringify(editableDoc.buttons));
		if (
			newButtons[draggedButtonSourceRow] &&
			newButtons[draggedButtonSourceRow][draggedButtonSourceIndex] !== undefined
		) {
			newButtons[draggedButtonSourceRow].splice(draggedButtonSourceIndex, 1);
			if (newButtons[draggedButtonSourceRow].length === 0) {
				newButtons.splice(draggedButtonSourceRow, 1);
			}
		}

		editableDoc.buttons = newButtons;
		draggedButton = null;
		draggedButtonSourceRow = null;
		draggedButtonSourceIndex = null;
		draggedButtonIsNew = false;
	}

	function removeButton(rowIdx, btnIdx) {
		let newButtons = JSON.parse(JSON.stringify(editableDoc.buttons));
		if (newButtons[rowIdx] && newButtons[rowIdx][btnIdx] !== undefined) {
			newButtons[rowIdx].splice(btnIdx, 1);
			if (newButtons[rowIdx].length === 0) {
				newButtons.splice(rowIdx, 1);
			}
		}
		editableDoc.buttons = newButtons;
	}

	function mergeRowWithPrevious(rowIdx) {
		if (rowIdx === 0) return;

		let newButtons = JSON.parse(JSON.stringify(editableDoc.buttons));
		const rowToMerge = newButtons.splice(rowIdx, 1)[0];
		newButtons[rowIdx - 1] = [...newButtons[rowIdx - 1], ...rowToMerge];

		editableDoc.buttons = newButtons;
	}

	function save() {
		const buttonsToSave = editableDoc.buttons.map((row) =>
			row.map((button) => ({ id: button.id }))
		);
		dispatch('save', { ...editableDoc, buttons: buttonsToSave });
	}

	function cancel() {
		dispatch('cancel');
	}

	async function createNewButton() {
		newButtonError = null;
		if (!newButtonText.trim() || !newButtonCallbackData.trim()) {
			newButtonError = 'Пожалуйста, введите текст и callback_data для новой кнопки.';
			return;
		}

		creatingNewButton = true;
		try {
			const response = await fetch('/api/buttons', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					text: newButtonText.trim(),
					callback_data: newButtonCallbackData.trim()
				})
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Ошибка при создании кнопки на сервере.');
			}

			const newButtonDoc = await response.json();

			if (!newButtonDoc || !newButtonDoc.insertedId) {
				throw new Error('Server response does not contain a valid button ID.');
			}

			const newButton = {
				id: newButtonDoc.insertedId,
				text: newButtonText,
				callback_data: newButtonCallbackData
			};

			availableButtons = [newButton, ...availableButtons];

			const newButtons = [...editableDoc.buttons];
			newButtons.push([{ id: newButton.id }]);
			editableDoc.buttons = newButtons;

			newButtonText = '';
			newButtonCallbackData = '';
		} catch (error) {
			newButtonError = error.message;
		} finally {
			creatingNewButton = false;
		}
	}

	function addAvailableButtonToNewRow(button) {
		let newButtons = JSON.parse(JSON.stringify(editableDoc.buttons));
		newButtons.push([{ id: button.id }]);
		editableDoc.buttons = newButtons;
	}
</script>

<div class="modal-overlay" transition:slide>
	<div class="modal-content">
		<h2>Редактировать клавиатуру</h2>
		<div
			class="scroll-container"
			on:touchmove={handleTouchMove}
			on:touchend|preventDefault={handleMoveEnd}
			on:touchcancel|preventDefault={handleMoveEnd}
		>
			<form on:submit|preventDefault={save}>
				{#each columns as col}
					{#if col !== '_id' && col !== 'buttons' && col !== 'created_at'}
						<div class="form-group">
							<label for={col}>{col.replace(/_/g, ' ')}:</label>
							<input
								type="text"
								id={col}
								bind:value={editableDoc[col]}
								on:input={(e) => handleInput(col, e)}
							/>
						</div>
					{/if}
				{/each}

				<div class="form-group date-display">
					<label>Дата создания:</label>
					<p class="italic-text">{formatDate(editableDoc.created_at)}</p>
				</div>

				<div class="form-group keyboard-builder-section">
					<label>Расположение кнопок:</label>
					<div class="keyboard-preview">
						{#each editableDoc.buttons as row, rowIdx}
							<div
								class="button-row"
								on:dragover={handleDragOver}
								on:drop={(e) => handleDrop(e, rowIdx, -1)}
								on:touchstart|preventDefault={(e) => {
									if (row.length === 0) {
										handleDrop(e, rowIdx, -1);
									}
								}}
							>
								{#each row as button, btnIdx}
									{@const buttonData = getButtonData(button.id)}
									<div
										class="keyboard-button"
										draggable="true"
										on:dragstart={(e) => handleDragStart(e, button, rowIdx, btnIdx, false)}
										on:dragover={handleDragOver}
										on:drop={(e) => handleDrop(e, rowIdx, btnIdx)}
										on:touchstart={(e) => handleTouchStart(e, button, rowIdx, btnIdx, false)}
									>
										<span>{buttonData.text}</span>
										<span class="callback-data-display">{buttonData.callback_data}</span>
										<button
											type="button"
											class="remove-button"
											on:click|stopPropagation={() => removeButton(rowIdx, btnIdx)}>&times;</button
										>
									</div>
								{/each}
								{#if row.length === 0}
									<div
										class="empty-drop-target"
										on:dragover={handleDragOver}
										on:drop={(e) => handleDrop(e, rowIdx, -1)}
										on:touchend|preventDefault={(e) => handleMoveEnd(e.target)}
									>
										Перетащите кнопки сюда, чтобы добавить в эту строку
									</div>
								{/if}
								{#if editableDoc.buttons.length > 1 && rowIdx > 0}
									<button
										type="button"
										class="merge-row-button"
										on:click={() => mergeRowWithPrevious(rowIdx)}
									>
										Слить с предыдущей строкой
									</button>
								{/if}
							</div>
						{/each}
						<div
							class="add-row-drop-zone"
							on:dragover={handleDragOver}
							on:drop={handleDropOnAddRow}
							on:touchend|preventDefault={(e) => handleMoveEnd(e.target)}
						>
							Перетащите кнопку сюда, чтобы создать новую строку
						</div>
						{#if editableDoc.buttons.length === 0}
							<div
								class="empty-keyboard-drop-target"
								on:dragover={handleDragOver}
								on:drop={(e) => handleDrop(e, -1)}
								on:touchend|preventDefault={(e) => handleMoveEnd(e.target)}
							></div>
						{/if}
					</div>
				</div>

				<div class="form-group available-buttons-section">
					<label>Доступные кнопки:</label>
					<div
						class="available-buttons-list"
						on:dragover={handleDragOver}
						on:drop={handleDropOnAvailableButtons}
						on:touchend|preventDefault={(e) => handleMoveEnd(e.target)}
					>
						{#if loadingAvailableButtons}
							<p>Загрузка доступных кнопок...</p>
						{:else if errorAvailableButtons}
							<p class="error-message">Ошибка загрузки кнопок: {errorAvailableButtons}</p>
						{:else if availableButtons.length > 0}
							{#each availableButtons as button (button.id)}
								<div
									class="available-button-wrapper"
									draggable="true"
									on:dragstart={(e) => handleDragStart(e, button, -1, -1, true)}
									on:touchstart={(e) => handleTouchStart(e, button, -1, -1, true)}
								>
									<div class="available-button-content">
										<span>{getButtonData(button.id).text}</span>
										<span class="callback-data-display"
											>{getButtonData(button.id).callback_data}</span
										>
									</div>
									<button
										type="button"
										class="add-to-new-row-button"
										on:click|stopPropagation={() => addAvailableButtonToNewRow(button)}
									>
										+
									</button>
								</div>
							{/each}
						{:else}
							<p>Кнопки в коллекции 'кнопко' не найдены. Добавьте их сначала!</p>
						{/if}
					</div>
				</div>
			</form>
		</div>
		<div class="new-button-creator">
			<input type="text" bind:value={newButtonText} placeholder="Текст новой кнопки" />
			<input type="text" bind:value={newButtonCallbackData} placeholder="Callback Data" />
			<button
				type="button"
				on:click={createNewButton}
				class="create-new-button"
				disabled={creatingNewButton || !newButtonText || !newButtonCallbackData}
			>
				{#if creatingNewButton}
					Создание...
				{:else}
					Создать новую кнопку
				{/if}
			</button>
		</div>
		{#if newButtonError}
			<p class="error-message">{newButtonError}</p>
		{/if}
		<div class="modal-actions">
			<button type="button" on:click={save} class="action-button save-button">Сохранить</button>
			<button type="button" on:click={cancel} class="action-button cancel-button">Отмена</button>
		</div>
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
		z-index: 1000;
	}

	.modal-content {
		background-color: var(--first-color);
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		width: 90%;
		max-width: 800px;
		color: var(--main-text);
		border: 1px solid var(--border-gray);
		max-height: 90vh;
		display: flex;
		flex-direction: column;
	}

	.scroll-container {
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		flex: 1;
	}

	h2 {
		color: var(--blue);
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

	.form-group input {
		width: calc(100% - 20px);
		padding: 0.8rem 10px;
		border: 1px solid var(--border-gray);
		border-radius: 5px;
		background-color: var(--second-color);
		color: var(--main-text);
		font-size: 1rem;
	}

	.form-group input:focus {
		outline: none;
		border-color: var(--blue);
		box-shadow: 0 0 0 2px rgba(var(--blue-rgb), 0.2);
	}

	.disabled-input {
		background-color: var(--first-color);
		color: var(--gray-text);
		cursor: not-allowed;
	}

	.date-display {
		display: flex;
		opacity: 0.5;
		gap: 2em;
	}

	.date-display p,
	.date-display label {
		margin-top: 0;
		color: var(--gray-text);
		font-weight: lighter;
		font-style: italic;
	}

	.italic-text {
		font-style: italic;
	}

	.modal-actions {
		margin-top: 2rem;
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
	}

	.action-button {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1rem;
		transition: background-color 0.2s ease;
	}

	.save-button {
		background-color: var(--action-button-color);
		color: white;
	}

	.save-button:hover {
		background-color: var(--action-button-hover-color);
	}

	.cancel-button {
		background-color: var(--second-color);
		color: var(--main-text);
		border: 1px solid var(--border-gray);
	}

	.cancel-button:hover {
		background-color: var(--hover-color);
	}

	.keyboard-builder-section {
		border: 1px solid var(--border-gray);
		border-radius: 8px;
		padding: 1rem;
		margin-top: 1.5rem;
		background-color: var(--second-color);
	}

	.keyboard-preview {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		border: 1px dashed var(--gray-text);
		padding: 0.5rem;
		border-radius: 5px;
		background-color: var(--first-color);
	}

	.button-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		min-height: 40px;
		border-bottom: 1px dashed rgba(var(--gray-text-rgb), 0.3);
		padding-bottom: 0.5rem;
		align-items: center;
		position: relative;
	}

	.button-row:last-of-type {
		border-bottom: none;
		padding-bottom: 0;
	}

	.keyboard-button {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		background-color: var(--action-button-color);
		color: white;
		padding: 0.6rem 1rem;
		padding-right: 2rem;
		border-radius: 5px;
		cursor: grab;
		gap: 0.2rem;
		user-select: none;
		position: relative;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: 0.9rem;
		touch-action: none;
	}

	.keyboard-button:active {
		cursor: grabbing;
	}

	.keyboard-button span {
		max-width: 10rem;
		display: block;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	.callback-data-display {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.7);
		overflow: hidden;
		text-overflow: ellipsis;
		width: 100%;
	}

	.remove-button {
		background: none;
		border: none;
		color: white;
		font-size: 1.2rem;
		cursor: pointer;
		padding: 0;
		line-height: 1;
		transition: color 0.2s ease;
		position: absolute;
		top: 5px;
		right: 5px;
	}

	.remove-button:hover {
		color: var(--decor-red);
	}

	.add-row-drop-zone {
		background-color: rgba(var(--decor-green-rgb), 0.2);
		color: var(--decor-green);
		border: 1px dashed var(--decor-green);
		border-radius: 5px;
		padding: 0.8rem 1rem;
		margin-top: 0.5rem;
		text-align: center;
		cursor: default;
		user-select: none;
		font-weight: bold;
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease;
	}

	.add-row-drop-zone:hover {
		background-color: rgba(var(--decor-green-rgb), 0.3);
		border-color: #218838;
	}

	.merge-row-button {
		display: none;
		background-color: #f0ad4e;
		color: white;
		border: none;
		padding: 0.4rem 0.8rem;
		border-radius: 5px;
		cursor: pointer;
		margin-left: auto;
		font-size: 0.85rem;
	}

	.merge-row-button:hover {
		background-color: #ec971f;
	}

	.available-buttons-section {
		margin-top: 2rem;
		border: 1px solid var(--border-gray);
		border-radius: 8px;
		padding: 1rem;
		background-color: var(--second-color);
	}

	.available-buttons-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding: 0.5rem;
		border: 1px dashed var(--gray-text);
		border-radius: 5px;
		min-height: 80px;
		background-color: var(--first-color);
		max-height: 250px;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.available-button-wrapper {
		display: flex;
		align-items: center;
		background-color: var(--decor-green);
		color: white;
		padding: 0.6rem 1rem;
		border-radius: 5px;
		cursor: grab;
		user-select: none;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 150px;
		gap: 0.5rem;
		font-size: 0.9rem;
		touch-action: none;
		position: relative;
	}

	.available-button-wrapper:active {
		cursor: grabbing;
	}

	.available-button-content {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		flex-grow: 1;
		overflow: hidden;
	}

	.add-to-new-row-button {
		background: rgba(0, 0, 0, 0.2);
		border: none;
		color: white;
		font-size: 1.2rem;
		font-weight: bold;
		cursor: pointer;
		border-radius: 50%;
		width: 25px;
		height: 25px;
		line-height: 25px;
		text-align: center;
		padding: 0;
		flex-shrink: 0;
		transition: background-color 0.2s ease;
	}

	.add-to-new-row-button:hover {
		background: rgba(0, 0, 0, 0.4);
	}

	.new-button-creator {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 1rem;
		align-items: center;
	}

	.new-button-creator input {
		flex-grow: 1;
	}

	.create-new-button {
		background-color: var(--blue);
		flex-grow: 1;
		color: white;
		border: none;
		padding: 0.75rem 1rem;
		border-radius: 5px;
		cursor: pointer;
		white-space: nowrap;
		font-size: 0.9rem;
	}

	.create-new-button:hover {
		background-color: var(--blue-dark);
	}

	.create-new-button:disabled {
		background-color: #666;
		cursor: not-allowed;
	}

	.error-message {
		background-color: #631c26;
		color: white;
		padding: 0.75rem;
		border-radius: 5px;
		margin-top: 0.5rem;
		font-size: 0.9rem;
	}

	@media (max-width: 768px) {
		.action-button {
			transform: scale(0.85);
			padding: 0.75rem 1.5rem;
			border: none;
			border-radius: 8px;
			cursor: pointer;
			font-size: 1rem;
			transition: background-color 0.2s ease;
		}
		.modal-actions {
			gap: -2rem;
		}
	}
</style>
