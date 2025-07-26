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
        startDate,
        endDate,
        interval,
        loadAllStatistics,
        registerLoadFunction,
        error
    } = getContext('statsContext');

    let selectedPattern = $state('');

    onMount(async () => {
        registerLoadFunction(async (startIso, endIso, currentInterval) => {
            await loadClickStats(startIso, endIso, selectedPattern);
        });
        registerLoadFunction(async (startIso, endIso, currentInterval) => {
            await loadTimeSeriesStats(startIso, endIso, currentInterval);
        });
        registerLoadFunction(async (startIso, endIso) => {
            await loadClicksByPatternStats(startIso, endIso);
        });

        await fetchHandlerPatterns();
    });

    function getAdjustedEndDateIso(dateString) {
        if (!dateString) return '';
        const dt = new Date(dateString);
        dt.setSeconds(59);
        dt.setMilliseconds(999);
        return dt.toISOString();
    }

    async function loadClickStats(startIso, endIso, pattern) {
        error.set(null);
        if (
            !startIso ||
            !endIso ||
            isNaN(new Date(startIso).getTime()) ||
            isNaN(new Date(endIso).getTime())
        ) {
            error.set('Пожалуйста, выберите корректные начальную и конечную даты.');
            return;
        }
        await fetchClickStatistics(startIso, endIso, pattern || null);
    }

    async function loadTimeSeriesStats(startIso, endIso, currentInterval) {
        error.set(null);
        if (
            !startIso ||
            !endIso ||
            isNaN(new Date(startIso).getTime()) ||
            isNaN(new Date(endIso).getTime())
        ) {
            error.set('Пожалуйста, выберите корректные начальную и конечную даты.');
            return;
        }

        let backendInterval = currentInterval;
        if (!['second', 'minute', 'hour', 'day', 'month'].includes(currentInterval)) {
            backendInterval = 'second';
        }

        await fetchTimeSeriesClickStatistics(startIso, endIso, backendInterval);
    }

    async function loadClicksByPatternStats(startIso, endIso) {
        error.set(null);
        if (
            !startIso ||
            !endIso ||
            isNaN(new Date(startIso).getTime()) ||
            isNaN(new Date(endIso).getTime())
        ) {
            error.set('Пожалуйста, выберите корректные начальную и конечную даты.');
            return;
        }
        await fetchClicksByPatternStatistics(startIso, endIso);
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
                <input type="datetime-local" id="statStartDate" value={startDate} on:change={loadAllStatistics} />
            </div>
            <div>
                <label for="statEndDate">Конечная дата:</label>
                <input type="datetime-local" id="statEndDate" value={endDate} on:change={loadAllStatistics} />
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

        {#if $error}
            <p class="error-message">Ошибка: {$error}</p>
        {:else if $loadingClickStatistics}
            <p>Загрузка общей статистики...</p>
        {:else if $clickStatistics && $clickStatistics.count !== undefined}
            <h3>Результаты:</h3>
            <p><strong>Количество кликов:</strong> {$clickStatistics.count}</p>
            <p><strong>Начальная дата:</strong> {new Date($clickStatistics.startDate).toLocaleString()}</p>
            <p><strong>Конечная дата:</strong> {new Date($clickStatistics.endDate).toLocaleString()}</p>
            <p><strong>Паттерн:</strong> {$clickStatistics.pattern || 'Все'}</p>
        {:else}
            <p>Общая статистика пока не загружена. Выберите даты и нажмите "Обновить статистику".</p>
        {/if}
    </section>

    <section class="stat-section">
        <h2>Статистика кликов по времени (Линейный график)</h2>
        <div class="input-group-container">
            <label for="interval">Интервал:</label>
            <select id="interval" value={interval} on:change={loadAllStatistics}>
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
        {#if $loadingTimeSeriesData}
            <p>Загрузка данных для линейного графика...</p>
        {:else if $error && aggregatedTimeSeriesData.length === 0}
            <p class="error-message">Ошибка загрузки данных для линейного графика: {$error}</p>
        {:else if aggregatedTimeSeriesData && aggregatedTimeSeriesData.length > 0}
            <div class="chart-container">
                <LineChart data={aggregatedTimeSeriesData} yAxisMax={lineChartYMax} />
            </div>
        {:else}
            <p>Нет данных для отображения линейного графика за выбранный период.</p>
        {/if}
    </section>

    <section class="stat-section">
        <h2>Статистика кликов по паттернам (Круговой график)</h2>
        <div class="input-group-container">
            
        </div>
        {#if $loadingClicksByPatternData}
            <p>Загрузка данных для кругового графика...</p>
        {:else if $error && pieChartData.length === 0}
            <p class="error-message">Ошибка загрузки данных для кругового графика: {$error}</p>
        {:else if pieChartData && pieChartData.length > 0}
            <div class="chart-container">
                <PieChart data={pieChartData} />
            </div>
        {:else}
            <p>
                Нет данных для отображения кругового графика за выбранный период.
            </p>
        {/if}
    </section>

<style>
    section {
        margin-bottom: 2rem;
        padding: 1rem;
        border: 1px solid #ccc;
        border-radius: 8px;
        background-color: #f9f9f9;
        color: black;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .input-group-container {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 1rem;
        align-items: center;
    }

    label {
        display: block;
        margin-bottom: 0.25rem;
        font-weight: bold;
    }

    input[type='datetime-local'],
    input[type='text'],
    select {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        width: 180px;
    }

    .update-button {
        padding: 0.5rem 1rem;
        background-color: #007acc;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    .update-button:hover {
        background-color: #005fa3 !important;
    }

    .error-message {
        color: red;
    }

    .chart-container {
        height: 300px;
    }

    input[type='range'] {
        flex-grow: 1;
        margin-right: 0.5rem;
    }

    .slider-label {
        min-width: 120px;
        text-align: right;
    }
</style>
