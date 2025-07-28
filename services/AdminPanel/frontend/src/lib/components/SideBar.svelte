<script>
	import Accordion from './Accordion.svelte';
	let props = $props();
</script>

{#snippet link(text, link, icon, isHeader = false)}
	<a
		href={link}
		class="link"
		class:is-header-link={isHeader}
		style="display: flex; align-items: center;"
	>
		{#if icon}
			<svg class="icon"><use href="/sprite.svg#{icon}"> </use></svg>
		{/if}
		<span style="margin-left: {icon ? '.5rem' : '0'};">{text}</span>
	</a>
{/snippet}

<div class="sidebar">
	{@render link('Главная', '/', 'home', true)}

	{#each props.config as section}
		<Accordion>
			{#snippet icon()}
				<svg class="icon"><use href="/sprite.svg#{section.icon}"></use></svg>
			{/snippet}
			{#snippet text()}
				<span>{section.header}</span>
			{/snippet}
			{#snippet details()}
				{#each section.items as subItem}
					{@render link(subItem.text, subItem.link, subItem.icon)}
				{/each}
			{/snippet}
		</Accordion>
	{/each}

	<div class="bottom-panel">
		<a href="/all" class="panel-icon-link" title="Общие настройки">
			<svg class="icon"><use href="/sprite.svg#globe"></use></svg>
		</a>
		<a href="/display-settings" class="panel-icon-link" title="Настройки отображения">
			<svg class="icon"><use href="/sprite.svg#adjustments-vertical"></use></svg>
		</a>
		<a href="/app-settings" class="panel-icon-link" title="Настройки приложения">
			<svg class="icon"><use href="/sprite.svg#cog"></use></svg>
		</a>
	</div>
</div>

<style>
	.sidebar {
		display: flex;
		flex-direction: column;
		background: #1f2a37;
		padding: 1rem;
		overflow-y: auto;
	}

	.sidebar > :not(.bottom-panel) {
		flex-grow: 0;
	}

	.link {
		padding: 9px 1rem;
		cursor: pointer;
		border-radius: 8px;
		color: inherit;
		text-decoration: none;
		transition: background-color 0.2s ease;
	}

	.link:hover {
		background: var(--border-gray);
	}

	.link .icon {
		width: 1rem;
		height: 1rem;
		color: var(--text-color-secondary, #b0b0b0);
		opacity: 0.8;
		flex-shrink: 0;
	}

	.link span {
		font-size: 0.95rem;
	}

	.link.is-header-link .icon {
		width: 1.5rem;
		height: 1.5rem;
		color: var(--text-color-primary, #fff);
		opacity: 1;
	}

	.link.is-header-link span {
		font-size: 1rem;
		font-weight: 500;
	}

	.bottom-panel {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0.75rem 1rem;
		border-top: 1px solid var(--border-gray, #374151);
		margin-top: auto;
		flex-shrink: 0;
	}

	.bottom-panel .panel-icon-link {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		border-radius: 8px;
		transition: background-color 0.2s ease;
	}

	.bottom-panel .panel-icon-link:hover {
		background: var(--border-gray);
	}

	.bottom-panel .icon {
		width: 1.5rem;
		height: 1.5rem;
		color: var(--text-color-secondary, #b0b0b0);
		opacity: 0.9;
	}
</style>
