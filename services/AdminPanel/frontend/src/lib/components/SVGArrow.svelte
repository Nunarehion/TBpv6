<script>
	export let isOpen = false;
</script>

<div class={`toggle ${isOpen ? 'isOpen' : ''}`}>
	<svg class="icon"><use href="/sprite.svg#chevron-up"></use></svg>
</div>

<style>
	.toggle {
		display: flex;
		transition: transform 0.3s;
		transform-origin: center;
	}
	.toggle svg {
		margin: auto;
	}
	.isOpen {
		transform: rotate(180deg);
	}
	.icon {
		width: 24px;
		aspect-ratio: 1/1;
	}
</style>
