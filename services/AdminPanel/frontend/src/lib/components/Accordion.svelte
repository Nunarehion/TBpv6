<script>
	let { open = true, ...props } = $props();

	import { slide } from 'svelte/transition';
	import SVGArrow from './SVGArrow.svelte';

	const handleClick = () => {
		open = !open;
	};
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="accordion" aria-expanded={open}>
	<div class="header" onclick={handleClick}>
		<div class="icon">
			{@render props.icon()}
		</div>
		<div class="text">
			{@render props.text()}
		</div>
		<div>
			<SVGArrow isOpen={open} />
		</div>
	</div>

	{#if open}
		<div class="details" transition:slide>
			{@render props.details()}
		</div>
	{/if}
</div>

<style>
	div.accordion {
		display: flex;
		flex-direction: column;
		margin: 1rem 0;
		overflow: hidden;
		height: max-content;
		font-weight: medium;
	}

	div.header {
		display: flex;
		align-items: center;
		padding: 9px 1rem;
		border-radius: 0.5rem;
	}
	div.header:hover {
		opacity: .9;
		cursor: pointer;
	}
	div.header .text {
		flex: 1;
		margin-right: 5px;
	}

	div.details {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 0.5rem 1rem;
		margin-left: 2rem;
		height: max-content;
	}
	div.icon {
		flex: 0 0 24px;
		height: 24px;
	}
	div.text {
		margin-left: 0.5rem;
	}
</style>
