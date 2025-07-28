<script>
	import { createEventDispatcher } from 'svelte';

	let { checked = false, label = '' } = $props();

	const dispatch = createEventDispatcher();

	let _checked = $state(checked);

	$effect(() => {
		if (_checked !== checked) {
			_checked = checked;
		}
	});

	function handleChange() {
		_checked = !_checked;
		dispatch('change', _checked);
	}
</script>

<label class="toggle-switch">
	<input type="checkbox" bind:checked={_checked} on:change={handleChange} />
	<span class="slider round"></span>
	{#if label}
		<span class="label-text">{label}</span>
	{/if}
</label>

<style>
	.toggle-switch {
		position: relative;
		display: inline-flex;
		width: 44px;
		height: 24px;
		align-items: center;
		cursor: pointer;
		user-select: none;
		gap: 8px;
	}

	.toggle-switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: var(--border-gray);
		transition:
			background-color 0.3s ease,
			box-shadow 0.3s ease;
		border-radius: 24px;
		box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
	}

	.slider:before {
		position: absolute;
		content: '';
		height: 18px;
		width: 18px;
		left: 3px;
		bottom: 3px;
		background-color: var(--border-gray);
		transition:
			transform 0.3s ease,
			background-color 0.3s ease;
		border-radius: 50%;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
	}

	input:checked + .slider {
		background-color: var(--decor-green);
		filter: brightness(0.85);
		box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
	}

	input:focus + .slider {
		box-shadow: 0 0 0 2px var(--action-button-color);
	}

	input:checked + .slider:before {
		transform: translateX(20px);
	}

	.slider.round {
		border-radius: 24px;
	}

	.slider.round:before {
		border-radius: 50%;
	}

	.label-text {
		margin-left: 54px;
		color: var(--main-text);
		font-size: 0.85rem;
		white-space: nowrap;
	}
</style>
