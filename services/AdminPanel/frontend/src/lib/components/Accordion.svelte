<script>
  export let open = true;
	import { slide } from 'svelte/transition';
	import SVGArrow from './SVGArrow.svelte'
	const handleClick = () => open = !open
</script>

<div class="accordion" onclick={handleClick} >
	<div class="header">
		<div class="text">
			<slot name="head"></slot>	
		</div>
		<div>
			<SVGArrow isOpen={open}/>
		</div>
	</div>
	
	{#if open}
	<div class="details" transition:slide>
		<slot name="details">
		</slot>
	</div>
	{/if}
</div>

<style>
	div.accordion {
		display: flex;
		flex-direction: column;
		margin: 1rem 0;
		overflow: hidden;
	}
	
	div.header {
		display:flex;
		padding: 1rem;
		border-radius: .5rem;
	}
	
	div.header:hover {
		background: #384152;
	}
	div.header .text {
		flex: 1;
		margin-right: 5px;
	}
	
	div.details {
		padding: 0.5rem 1rem;
		background: #111828;
		color: #9ba1af
		
	}
</style>