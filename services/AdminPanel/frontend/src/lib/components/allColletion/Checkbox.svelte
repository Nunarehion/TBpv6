<script>
	export let checked = false;
	export let disabled = false;
	export let id = '';
	export let name = '';
</script>

<label class="checkbox-wrapper" for={id}>
	<input type="checkbox" bind:checked {disabled} {id} {name} />
	<span class="custom-checkbox"></span>
	<slot></slot>
</label>

<style>
	.checkbox-wrapper {
		display: inline-flex;
		align-items: center;
		cursor: pointer;
		user-select: none;
		position: relative;
	}

	.checkbox-wrapper input[type='checkbox'] {
		appearance: none;
		-webkit-appearance: none;
		width: 20px;
		height: 20px;
		border: 2px solid var(--border-gray);
		border-radius: 4px;
		background-color: var(--second-color);
		position: relative;
		cursor: pointer;
		margin: 0;
		transition:
			background-color 0.2s,
			border-color 0.2s;
	}
	/* 
	.checkbox-wrapper input[type='checkbox']:checked {
		background-color: #007acc;
		border-color: #007acc;
	} */

	.checkbox-wrapper input[type='checkbox']:checked::after {
		content: '';
		/* position: absolute;
		left: 6px;
		top: 2px;
		width: 6px;
		height: 12px;
		border: solid white;
		border-width: 0 3px 3px 0;
		transform: rotate(45deg); */
	}

	.checkbox-wrapper input[type='checkbox']:disabled {
		background-color: #ccc;
		border-color: #999;
		cursor: not-allowed;
	}

	.checkbox-wrapper input[type='checkbox']:disabled::after {
		border-color: #666;
	}
</style>
