<script>
	import Accordion from './Accordion.svelte';
	let props = $props();
</script>

{#each props.config as item}
	<!-- {JSON.stringify(item)} -->
{/each}

<div class="sidebar">
	{#each props.config as item}
		<Accordion>
			<span slot="head">{item.header}</span>
			<div slot="details">
				{#each item.items as item}
					<li>{item}</li>
				{/each}
			</div>
		</Accordion>
	{/each}
</div>

<style>
	.sidebar {
		display: flex;
		flex-direction: column;
		background: #1f2a37;
		height: 100vh;
	}
	li {
		list-style-type: none;
	}
</style>
