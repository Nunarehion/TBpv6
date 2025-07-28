<script>
	export let width = '100%';
	export let height = '100%';
	export let borderRadius = '8px';
	export let type = 'box';
</script>

<div
	class="skeleton"
	class:skeleton-box={type === 'box'}
	class:skeleton-text={type === 'text'}
	class:skeleton-circle={type === 'circle'}
	style="width: {width}; height: {height}; border-radius: {borderRadius};"
></div>

<style>
	.skeleton {
		background-color: var(--border-gray);
		animation: pulse 1.5s infinite ease-in-out;
		opacity: 0.7;
	}

	.skeleton-text {
		height: 1em;
		margin-bottom: 0.5em;
		transform-origin: left;
	}

	.skeleton-circle {
		border-radius: 50%;
	}

	@keyframes pulse {
		0% {
			opacity: 0.7;
		}
		50% {
			opacity: 0.3;
		}
		100% {
			opacity: 0.7;
		}
	}
</style>
