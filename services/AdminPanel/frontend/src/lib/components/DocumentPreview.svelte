<script>
	import { createEventDispatcher } from 'svelte';
	import DocumentsTable from '$lib/components/allColletion/DocumentsTable.svelte';

	let {
		documents = [],
		loading = false,
		selectedCollection,
		isMessageRoute = false,
		displayFields = [],
		...props
	} = $props();

	const dispatch = createEventDispatcher();

	function handleAdd() {
		if (!selectedCollection || displayFields.length === 0) return;

		const newDoc = {};
		for (const key of displayFields) {
			if (key !== '_id' && key !== 'created_at' && key !== 'updated_at') {
				newDoc[key] = '';
			}
		}

		dispatch('add', newDoc);
	}

	function handleSave(doc) {
		dispatch('save', doc);
	}

	function handleDelete(doc) {
		dispatch('delete', doc);
	}

	function getTableColumns(docs, fieldsToFilter, fieldsToOrder) {
		if (docs.length === 0) return [];

		const allKeys = Array.from(new Set(docs.flatMap((doc) => Object.keys(doc))));
		let finalColumns = [];

		if (fieldsToFilter && fieldsToFilter.length > 0) {
			finalColumns = fieldsToFilter.filter((key) => allKeys.includes(key));
		} else {
			finalColumns = allKeys;
		}

		if (fieldsToOrder && fieldsToOrder.length > 0) {
			const ordered = fieldsToOrder.filter((key) => finalColumns.includes(key));
			const remaining = finalColumns.filter((key) => !ordered.includes(key));
			return [...ordered, ...remaining];
		} else {
			return finalColumns;
		}
	}

	let orderedFields = $derived(
		documents.length > 0 ? getTableColumns(documents, displayFields, props.orderFields) : []
	);
</script>

{#if selectedCollection}
	<div class="wrap">
		{#if loading}
			<p>Загрузка документов...</p>
		{:else if documents.length === 0}
			<p>Документы отсутствуют.</p>
		{/if}

		<DocumentsTable
			{documents}
			{orderedFields}
			{isMessageRoute}
			selectedCollection={props.selectedCollection}
			on:save={(e) => handleSave(e.detail)}
			on:add={handleAdd}
			on:delete={(e) => handleDelete(e.detail)}
		/>
	</div>
{/if}

<style>
	.wrap {
		display: grid;
		padding: 2rem;
	}
</style>
