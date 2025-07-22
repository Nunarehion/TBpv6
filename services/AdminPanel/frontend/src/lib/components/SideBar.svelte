<script>
	import Accordion from './Accordion.svelte';
	let props = $props();
</script>

{#each props.config as item}
	<!-- {JSON.stringify(item)} -->
{/each}
{#snippet link(text, link, icon)}
	<a href={link} class="link" style="display: flex; align-items: center;">
		<svg class="icon" style="width: 2rem; height:2rem"><use href="/sprite.svg#{icon}"></use></svg>
		<span style="margin-left: .5rem;">{text}</span>
	</a>
{/snippet}

<div class="sidebar">
	{@render link('Главная', '/', 'home')}
	{#each props.config as item}
		<Accordion>
			{#snippet icon()}
				<svg class="icon"><use href="/sprite.svg#{item.icon}"></use></svg>
			{/snippet}
			{#snippet text()}
				<span>{item.header}</span>
			{/snippet}
			{#snippet details()}
				{#each item.items as item}
					<a href={item.link} class="link">{item.text}</a>
				{/each}
			{/snippet}
		</Accordion>
	{/each}
</div>

<style>
	.sidebar {
		display: flex;
		flex-direction: column;
		background: #1f2a37;
		height: 100vh;
		padding: 1rem;
	}
	.link {
		padding: 9px 1rem;
		cursor: pointer;
		border-radius: 8px;
	}
	.link:hover {
		background: var(--border-gray);
	}
</style>
