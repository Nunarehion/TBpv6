<script>
    import { onMount, getContext } from 'svelte';
    import {
        clickStatistics,
        loadingClickStatistics,
        fetchClickStatistics,
        timeSeriesData,
        loadingTimeSeriesData,
        fetchTimeSeriesClickStatistics,
        clicksByPatternData,
        loadingClicksByPatternData,
        fetchClicksByPatternStatistics,
        handlerPatterns,
        fetchHandlerPatterns
    } from '$lib/stores/db.js';

    import LineChart from '$lib/components/charts/LineChart.svelte';
    import PieChart from '$lib/components/charts/PieChart.svelte';

    const {
        loadAllStatistics,
        registerLoadFunction,
        error,
        interval: sharedInterval
    } = getContext('statsContext');

    let startDate = $state('');
    let endDate = $state('');
    let interval = $state(sharedInterval);

    let selectedPattern = $state('');

    let showLoadingMessage = $state(false);

    onMount(async () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        endDate = tomorrow.toISOString().slice(0, 10);

        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = sevenDaysAgo.toISOString().slice(0, 10);

        // Register load functions with a delay wrapper
        registerLoadFunction(async (startIso, endIso) => {
            await delayedLoad(loadClickStats, startIso, endIso, selectedPattern);
        });
        registerLoadFunction(async (startIso, endIso, currentInterval) => {
            await delayedLoad(loadTimeSeriesStats, startIso, endIso, currentInterval);
        });
        registerLoadFunction(async (startIso, endIso) => {
            await delayedLoad(loadClicksByPatternStats, startIso, endIso);
        });

        await fetchHandlerPatterns();
        await loadAllStatistics();
    });

    // Utility function to enforce a minimum loading display time
    async function delayedLoad(func, ...args) {
        showLoadingMessage = true;
        const startTime = Date.now();
        await func(...args);
        const elapsedTime = Date.now() - startTime;
        const minDisplayTime = 300; // Minimum time loading message is shown in ms

        if (elapsedTime < minDisplayTime) {
            await new Promise(resolve => setTimeout(resolve, minDisplayTime - elapsedTime));
        }
        showLoadingMessage = false;
    }

    function getAdjustedEndDateIso(dateString) {
        if (!dateString) return '';
        const dt = new Date(dateString);
        dt.setHours(23, 59, 59, 999);
        return dt.toISOString();
    }

    async function loadClickStats(startIso, endIso, pattern) {
        error.set(null);
        const adjustedEndIso = getAdjustedEndDateIso(endIso);
        if (
            !startIso ||
            !adjustedEndIso ||
            isNaN(new Date(startIso).getTime()) ||
            isNaN(new Date(adjustedEndIso).getTime())
        ) {
            error.set('Пожалуйста, выберите корректные начальную и конечную даты.');
            return;
        }
        await fetchClickStatistics(startIso, adjustedEndIso, pattern || null);
    }

    async function loadTimeSeriesStats(startIso, endIso, currentInterval) {
        error.set(null);
        const adjustedEndIso = getAdjustedEndDateIso(endIso);
        if (
            !startIso ||
            !adjustedEndIso ||
            isNaN(new Date(startIso).getTime()) ||
            isNaN(new Date(adjustedEndIso).getTime())
        ) {
            error.set('Пожалуйста, выберите корректные начальную и конечную даты.');
            return;
        }

        let backendInterval = currentInterval;
        if (!['second', 'minute', 'hour', 'day', 'month'].includes(currentInterval)) {
            backendInterval = 'second';
        }

        await fetchTimeSeriesClickStatistics(startIso, adjustedEndIso, backendInterval);
    }

    async function loadClicksByPatternStats(startIso, endIso) {
        error.set(null);
        const adjustedEndIso = getAdjustedEndDateIso(endIso);
        if (
            !startIso ||
            !adjustedEndIso ||
            isNaN(new Date(startIso).getTime()) ||
            isNaN(new Date(adjustedEndIso).getTime())
        ) {
            error.set('Пожалуйста, выберите корректные начальную и конечную даты.');
            return;
        }
        await fetchClicksByPatternStatistics(startIso, adjustedEndIso);
    }

    function aggregateData(data, customInterval) {
        if (!data || data.length === 0) return [];

        const aggregated = {};
        const intervalMs = {
            '15_seconds': 15 * 1000,
            '10_minutes': 10 * 60 * 1000,
            half_hour: 30 * 60 * 1000,
            '12_hours': 12 * 60 * 60 * 1000,
            '3_days': 3 * 24 * 60 * 60 * 1000,
            week: 7 * 24 * 60 * 60 * 1000,
            '4_months': 4 * 30 * 24 * 60 * 60 * 1000
        };

        const currentIntervalMs = intervalMs[customInterval];
        if (!currentIntervalMs) {
            return data;
        }

        data.forEach((item) => {
            const itemTime = new Date(item.time).getTime();
            const bucketStart = Math.floor(itemTime / currentIntervalMs) * currentIntervalMs;

            if (!aggregated[bucketStart]) {
                aggregated[bucketStart] = { time: new Date(bucketStart), count: 0 };
            }
            aggregated[bucketStart].count += item.count;
        });

        return Object.values(aggregated).sort((a, b) => a.time.getTime() - b.time.getTime());
    }

    let aggregatedTimeSeriesData = $derived.by(() => {
        if (['second', 'minute', 'hour', 'day', 'month'].includes(interval)) {
            return $timeSeriesData;
        }
        return aggregateData($timeSeriesData, interval);
    });

    let pieChartData = $derived.by(() => {
        return $clicksByPatternData;
    });

    let lineChartYMax = $derived.by(() => {
        if (!aggregatedTimeSeriesData || aggregatedTimeSeriesData.length === 0) {
            return 10;
        }
        const maxCount = Math.max(...aggregatedTimeSeriesData.map((d) => d.count));
        const buffer = 10;
        const percentageBuffer = maxCount * 0.1;
        return Math.ceil(maxCount + buffer + percentageBuffer);
    });
</script>

<h1>Статистика Бота</h1>

<section class="stat-section">
    <h2>Общая статистика</h2>
    <div class="input-group-container">
        <div>
            <label for="statStartDate">Начальная дата:</label>
            <input type="date" id="statStartDate" bind:value={startDate} on:change={loadAllStatistics} />
        </div>
        <div>
            <label for="statEndDate">Конечная дата:</label>
            <input type="date" id="statEndDate" bind:value={endDate} on:change={loadAllStatistics} />
        </div>
        <div>
            <label for="statPattern">Паттерн (опционально):</label>
            <input
                type="text"
                id="statPattern"
                bind:value={selectedPattern}
                placeholder="Например, query/button_1"
                on:change={loadAllStatistics}
            />
        </div>
        <button on:click={loadAllStatistics} class="update-button"> Обновить статистику </button>
    </div>

    <div class="summary-content-placeholder">
        {#if $error}
            <p class="error-message transition-fade">Ошибка: {$error}</p>
        {:else if $loadingClickStatistics || showLoadingMessage}
            <p class="info-message transition-fade">Загрузка общей статистики...</p>
        {:else if $clickStatistics && $clickStatistics.count !== undefined}
            <div class="stats-card transition-fade">
                <p class="stat-value">{$clickStatistics.count}</p>
                <p class="stat-label">Количество кликов</p>
            </div>
        {:else}
            <p class="info-message transition-fade">
                Общая статистика пока не загружена. Выберите даты и нажмите "Обновить статистику".
            </p>
        {/if}
    </div>
</section>

<section class="stat-section">
    <h2>Статистика кликов по времени (Линейный график)</h2>
    <div class="input-group-container">
        <label for="interval">Интервал:</label>
        <select id="interval" bind:value={interval} on:change={loadAllStatistics}>
            <option value="second">По секундам</option>
            <option value="minute">По минутам</option>
            <option value="hour">По часам</option>
            <option value="day">По дням</option>
            <option value="month">По месяцам</option>
            <option value="15_seconds">По 15 секунд</option>
            <option value="10_minutes">По 10 минут</option>
            <option value="half_hour">По полчаса</option>
            <option value="12_hours">По 12 часов</option>
            <option value="3_days">По 3 дня</option>
            <option value="week">По неделям</option>
            <option value="4_months">По 4 месяца</option>
        </select>
    </div>
    <div class="chart-container">
        {#if $loadingTimeSeriesData || showLoadingMessage}
            <p class="info-message transition-fade">Загрузка данных для линейного графика...</p>
        {:else if $error && aggregatedTimeSeriesData.length === 0}
            <p class="error-message transition-fade">Ошибка загрузки данных для линейного графика: {$error}</p>
        {:else if aggregatedTimeSeriesData && aggregatedTimeSeriesData.length > 0}
            <LineChart data={aggregatedTimeSeriesData} yAxisMax={lineChartYMax} />
        {:else}
            <p class="info-message transition-fade">Нет данных для отображения линейного графика за выбранный период.</p>
        {/if}
    </div>
</section>

<section class="stat-section">
    <h2>Статистика кликов по паттернам (Круговой график)</h2>
    <div class="input-group-container"></div>
    <div class="chart-container">
        {#if $loadingClicksByPatternData || showLoadingMessage}
            <p class="info-message transition-fade">Загрузка данных для кругового графика...</p>
        {:else if $error && pieChartData.length === 0}
            <p class="error-message transition-fade">Ошибка загрузки данных для кругового графика: {$error}</p>
        {:else if pieChartData && pieChartData.length > 0}
            <PieChart data={pieChartData} />
        {:else}
            <p class="info-message transition-fade">Нет данных для отображения кругового графика за выбранный период.</p>
        {/if}
    </div>
</section>

<style>
    /* Глобальные переменные предполагаются, поэтому :root удален */

    body {
        background-color: var(--first-color);
        color: var(--main-text);
        font-family: 'Inter', sans-serif;
    }

    h1 {
        text-align: center;
        margin-bottom: 2rem;
        color: var(--gray-text);
        font-size: 2.5rem;
    }

    h2 {
        color: var(--gray-text);
        margin-bottom: 1.5rem;
        font-size: 1.75rem;
        border-bottom: 1px solid var(--border-gray);
        padding-bottom: 0.5rem;
    }

    section {
        align-self: stretch;
        margin-bottom: 2.5rem;
        padding: 2rem;
        border: 1px solid var(--border-gray);
        border-radius: 10px;
        background-color: var(--first-color);
        color: var(--main-text);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        max-width: 1200px;
        box-sizing: border-box;
    }

    .input-group-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 1.5rem;
        align-items: end;
    }

    .input-group-container > div {
        display: flex;
        flex-direction: column;
    }

    label {
        margin-bottom: 0.5rem;
        font-weight: bold;
        color: var(--gray-text);
        font-size: 0.95rem;
    }

    input[type='date'],
    input[type='text'],
    select {
        padding: 0.75rem;
        border: 1px solid var(--border-gray);
        border-radius: 6px;
        background-color: var(--first-color);
        color: var(--main-text);
        font-size: 1rem;
        width: 100%;
        box-sizing: border-box;
    }

    input[type='date']::-webkit-calendar-picker-indicator {
        filter: invert(1);
    }

    .update-button {
        padding: 0.75rem 1.5rem;
        background-color: var(--action-button-color);
        color: var(--main-text);
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.3s ease;
        align-self: flex-end;
    }

    .update-button:hover {
        background-color: var(--action-button-hover-color);
    }

    .transition-fade {
        opacity: 1;
        transition: opacity 0.3s ease-in-out;
    }

    .loading-message,
    .info-message {
        background-color: var(--info-message-bg);
        color: var(--main-text);
        padding: 1rem;
        border-radius: 6px;
        margin-top: 1rem;
        text-align: center;
        border: 1px solid var(--border-gray);
    }

    .error-message {
        background-color: #631c26;
        color: var(--main-text);
        padding: 1rem;
        border-radius: 6px;
        margin-top: 1rem;
        text-align: center;
        border: 1px solid var(--decor-red);
    }

    .chart-container {
        height: 350px;
        width: 100%;
        margin-top: 1.5rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    p {
        color: var(--main-text);
    }

    p strong {
        color: var(--decor-green);
    }

    .summary-content-placeholder {
        height: 120px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        transition: all 0.3s ease-in-out;
    }

    .stats-card {
        background-color: var(--second-color);
        border: 1px solid var(--border-gray);
        border-radius: 8px;
        padding: 1.5rem 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        max-width: fit-content;
        margin: auto;
        margin-bottom: 1rem;
        margin-top: 1rem;
    }

    .stats-card .stat-value {
        font-size: 3.5rem;
        font-weight: bold;
        color: var(--decor-green);
        margin-bottom: 0.5rem;
        line-height: 1;
    }

    .stats-card .stat-label {
        font-size: 1.1rem;
        color: var(--gray-text);
    }
</style>