<script>
    import { setContext, onMount } from 'svelte';
    import { error } from '$lib/stores/db.js';

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const initialEndDate = tomorrow.toISOString().slice(0, 10);

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const initialStartDate = sevenDaysAgo.toISOString().slice(0, 10);

    let startDate = $state(initialStartDate);
    let endDate = $state(initialEndDate);
    let interval = $state('hour');

    const registeredLoadFunctions = [];

    const registerLoadFunction = (func) => {
        registeredLoadFunctions.push(func);
    };

    function getAdjustedEndDateIso(dateString) {
        if (!dateString) return '';
        const dt = new Date(dateString);
        dt.setHours(23, 59, 59, 999);
        return dt.toISOString();
    }

    async function loadAllStatistics() {
        error.set(null);
        const startIso = startDate ? new Date(startDate).toISOString() : '';
        const endIso = getAdjustedEndDateIso(endDate);

        if (
            !startIso ||
            !endIso ||
            isNaN(new Date(startIso).getTime()) ||
            isNaN(new Date(endIso).getTime())
        ) {
            error.set('Пожалуйста, выберите корректные начальную и конечную даты.');
            return;
        }

        for (const func of registeredLoadFunctions) {
            await func(startIso, endIso, interval);
        }
    }

    let derivedStartDate = $derived(startDate);
    let derivedEndDate = $derived(endDate);
    let derivedInterval = $derived(interval);

    setContext('statsContext', {
        startDate: derivedStartDate,
        endDate: derivedEndDate,
        interval: derivedInterval,
        loadAllStatistics,
        registerLoadFunction,
        error
    });

    onMount(async () => {
        await loadAllStatistics();
    });
</script>

<div class="page-wrapper">
    <slot />
</div>

<style>
    .page-wrapper {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem;
    }
</style>