<script>
	import { onMount } from 'svelte';
	import { on } from 'svelte/events';

	let { children, data } = $props();
</script>

{@render children?.()}