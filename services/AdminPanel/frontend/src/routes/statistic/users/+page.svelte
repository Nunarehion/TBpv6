<script>
    import { onMount } from 'svelte';
    import {
        totalUsersStatistics,
        loadingTotalUsersStatistics,
        fetchTotalUsersStatistics,
        newUsersTimeSeriesData,
        loadingNewUsersTimeSeriesData,
        fetchNewUsersTimeSeries,
        activeUsersTimeSeriesData,
        loadingActiveUsersTimeSeriesData,
        fetchActiveUsersTimeSeries,
        mostActiveUsersData,
        loadingMostActiveUsersData,
        fetchMostActiveUsers,
        error
    } from '$lib/stores/db.js';

    import LineChart from '$lib/components/charts/LineChart.svelte';

    let startDate = $state('');
    let endDate = $state('');
    let interval = $state('hour');

    let mostActiveUsersLimit = $state(10);

    const registeredLoadFunctions = [];

    const registerLoadFunction = (func) => {
        registeredLoadFunctions.push(func);
    };

    function getAdjustedStartDateIso(dateString) {
        if (!dateString) return '';
        const dt = new Date(dateString);
        dt.setHours(0, 0, 0, 0);
        return dt.toISOString();
    }

    function getAdjustedEndDateIso(dateString) {
        if (!dateString) return '';
        const dt = new Date(dateString);
        dt.setHours(23, 59, 59, 999);
        return dt.toISOString();
    }

    async function loadAllStatistics() {
        error.set(null);

        const startIso = getAdjustedStartDateIso(startDate);
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

    onMount(async () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        endDate = tomorrow.toISOString().slice(0, 10);

        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = sevenDaysAgo.toISOString().slice(0, 10);

        registerLoadFunction(async (startIso, endIso) => {
            await loadTotalUsersStats(startIso, endIso);
        });
        registerLoadFunction(async (startIso, endIso, currentInterval) => {
            await loadNewUsersTimeSeriesStats(startIso, endIso, currentInterval);
        });
        registerLoadFunction(async (startIso, endIso, currentInterval) => {
            await loadActiveUsersTimeSeriesStats(startIso, endIso, currentInterval);
        });
        registerLoadFunction(async (startIso, endIso) => {
            await loadMostActiveUsersStats(startIso, endIso, mostActiveUsersLimit);
        });

        await loadAllStatistics();
    });

    async function loadTotalUsersStats(startIso, endIso) {
        error.set(null);
        await fetchTotalUsersStatistics(startIso, endIso);
    }

    async function loadNewUsersTimeSeriesStats(startIso, endIso, currentInterval) {
        error.set(null);
        let backendInterval = currentInterval;
        if (!['second', 'minute', 'hour', 'day', 'month'].includes(currentInterval)) {
            backendInterval = 'second';
        }
        await fetchNewUsersTimeSeries(startIso, endIso, backendInterval);
    }

    async function loadActiveUsersTimeSeriesStats(startIso, endIso, currentInterval) {
        error.set(null);
        let backendInterval = currentInterval;
        if (!['second', 'minute', 'hour', 'day', 'month'].includes(currentInterval)) {
            backendInterval = 'second';
        }
        await fetchActiveUsersTimeSeries(startIso, endIso, backendInterval);
    }

    async function loadMostActiveUsersStats(startIso, endIso, limit) {
        error.set(null);
        await fetchMostActiveUsers(startIso, endIso, limit);
    }

    function generateFullDateRange(start, end, intervalType) {
        const dates = [];
        let currentDate = new Date(start);
        const endDateObj = new Date(end);

        while (currentDate <= endDateObj) {
            dates.push(new Date(currentDate));

            if (intervalType === 'second') {
                currentDate.setSeconds(currentDate.getSeconds() + 1);
            } else if (intervalType === 'minute') {
                currentDate.setMinutes(currentDate.getMinutes() + 1);
            } else if (intervalType === 'hour') {
                currentDate.setHours(currentDate.getHours() + 1);
            } else if (intervalType === 'day') {
                currentDate.setDate(currentDate.getDate() + 1);
            } else if (intervalType === 'month') {
                currentDate.setMonth(currentDate.getMonth() + 1);
            } else if (intervalType === '15_seconds') {
                currentDate.setSeconds(currentDate.getSeconds() + 15);
            } else if (intervalType === '10_minutes') {
                currentDate.setMinutes(currentDate.getMinutes() + 10);
            } else if (intervalType === 'half_hour') {
                currentDate.setMinutes(currentDate.getMinutes() + 30);
            } else if (intervalType === '12_hours') {
                currentDate.setHours(currentDate.getHours() + 12);
            } else if (intervalType === '3_days') {
                currentDate.setDate(currentDate.getDate() + 3);
            } else if (intervalType === 'week') {
                currentDate.setDate(currentDate.getDate() + 7);
            } else if (intervalType === '4_months') {
                currentDate.setMonth(currentDate.getMonth() + 4);
            } else {
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
        return dates;
    }

    let aggregatedNewUsersData = $derived.by(() => {
        const rawData = $newUsersTimeSeriesData;
        const currentInterval = interval;

        if (!startDate || !endDate || rawData.length === 0) {
            return [];
        }

        const start = getAdjustedStartDateIso(startDate);
        const end = getAdjustedEndDateIso(endDate);

        const fullRange = generateFullDateRange(start, end, currentInterval);

        const dataMap = new Map();
        rawData.forEach(item => {
            dataMap.set(new Date(item.time).toISOString(), item.count);
        });

        const result = fullRange.map(date => {
            const isoString = date.toISOString();
            const count = dataMap.get(isoString) || 0;
            return { time: isoString, count: count };
        });

        return result;
    });

    let aggregatedActiveUsersData = $derived.by(() => {
        const rawData = $activeUsersTimeSeriesData;
        const currentInterval = interval;

        if (!startDate || !endDate || rawData.length === 0) {
            return [];
        }

        const start = getAdjustedStartDateIso(startDate);
        const end = getAdjustedEndDateIso(endDate);

        const fullRange = generateFullDateRange(start, end, currentInterval);

        const dataMap = new Map();
        rawData.forEach(item => {
            dataMap.set(new Date(item.time).toISOString(), item.count);
        });

        const result = fullRange.map(date => {
            const isoString = date.toISOString();
            const count = dataMap.get(isoString) || 0;
            return { time: isoString, count: count };
        });

        return result;
    });

    let newUsersYMax = $derived.by(() => {
        if (!aggregatedNewUsersData || aggregatedNewUsersData.length === 0) {
            return 10;
        }
        const maxCount = Math.max(...aggregatedNewUsersData.map((d) => d.count));
        const buffer = 10;
        const percentageBuffer = maxCount * 0.1;
        return Math.ceil(maxCount + buffer + percentageBuffer);
    });

    let activeUsersYMax = $derived.by(() => {
        if (!aggregatedActiveUsersData || aggregatedActiveUsersData.length === 0) {
            return 10;
        }
        const maxCount = Math.max(...aggregatedActiveUsersData.map((d) => d.count));
        const buffer = 10;
        const percentageBuffer = maxCount * 0.1;
        return Math.ceil(maxCount + buffer + percentageBuffer);
    });
</script>

<h1>Статистика Пользователей</h1>

<section class="stat-section">
    <h2>Общая статистика пользователей</h2>
    <div class="input-group-container">
        <div>
            <label for="statStartDate">Начальная дата:</label>
            <input
                type="date"
                id="statStartDate"
                bind:value={startDate}
                on:change={loadAllStatistics}
                min="2020-01-01"
                max="2030-12-31"
            />
        </div>
        <div>
            <label for="statEndDate">Конечная дата:</label>
            <input
                type="date"
                id="statEndDate"
                bind:value={endDate}
                on:change={loadAllStatistics}
                min="2020-01-01"
                max="2030-12-31"
            />
        </div>
        <button on:click={loadAllStatistics} class="update-button"> Обновить статистику </button>
    </div>

    <div class="summary-content-placeholder">
        {#if $error}
            <p class="error-message">Ошибка: {$error}</p>
        {:else if $loadingTotalUsersStatistics}
            <p class="info-message">Загрузка общей статистики пользователей...</p>
        {:else if $totalUsersStatistics && $totalUsersStatistics.count !== undefined}
            <div class="user-stats-card">
                <p class="stat-value">{$totalUsersStatistics.count}</p>
                <p class="stat-label">Общее количество уникальных пользователей</p>
            </div>
        {:else}
            <p class="info-message">
                Общая статистика пользователей пока не загружена. Выберите даты и нажмите "Обновить
                статистику".
            </p>
        {/if}
    </div>
</section>

<section class="stat-section">
    <h2>Новые пользователи по времени (Линейный график)</h2>
    <div class="input-group-container">
        <label for="intervalNewUsers">Интервал:</label>
        <select id="intervalNewUsers" bind:value={interval} on:change={loadAllStatistics}>
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
        {#if $loadingNewUsersTimeSeriesData}
            <p class="info-message">Загрузка данных для графика новых пользователей...</p>
        {:else if $error && aggregatedNewUsersData.length === 0}
            <p class="error-message">Ошибка загрузки данных для графика новых пользователей: {$error}</p>
        {:else if aggregatedNewUsersData && aggregatedNewUsersData.length > 0}
            <LineChart data={aggregatedNewUsersData} yAxisMax={newUsersYMax} />
        {:else}
            <p class="info-message">
                Нет данных для отображения графика новых пользователей за выбранный период.
            </p>
        {/if}
    </div>
</section>

<section class="stat-section">
    <h2>Активные пользователи по времени (Линейный график)</h2>
    <div class="input-group-container">
        <label for="intervalActiveUsers">Интервал:</label>
        <select id="intervalActiveUsers" bind:value={interval} on:change={loadAllStatistics}>
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
        {#if $loadingActiveUsersTimeSeriesData}
            <p class="info-message">Загрузка данных для графика активных пользователей...</p>
        {:else if $error && aggregatedActiveUsersData.length === 0}
            <p class="error-message">
                Ошибка загрузки данных для графика активных пользователей: {$error}
            </p>
        {:else if aggregatedActiveUsersData && aggregatedActiveUsersData.length > 0}
            <LineChart data={aggregatedActiveUsersData} yAxisMax={activeUsersYMax} />
        {:else}
            <p class="info-message">
                Нет данных для отображения графика активных пользователей за выбранный период.
            </p>
        {/if}
    </div>
</section>

<section class="stat-section">
    <h2>Самые активные пользователи</h2>
    <div class="input-group-container">
        <div>
            <label for="mostActiveLimit">Показать:</label>
            <input
                type="number"
                id="mostActiveLimit"
                bind:value={mostActiveUsersLimit}
                min="1"
                max="100"
                on:change={loadAllStatistics}
            />
        </div>
        <button on:click={loadAllStatistics} class="update-button"> Обновить список </button>
    </div>

    {#if $error}
        <p class="error-message">Ошибка: {$error}</p>
    {:else if $loadingMostActiveUsersData}
        <p class="info-message">Загрузка данных о самых активных пользователях...</p>
    {:else if $mostActiveUsersData && $mostActiveUsersData.length > 0}
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID Пользователя</th>
                        <th>Имя пользователя</th>
                        <th>Имя</th>
                        <th>Фамилия</th>
                        <th>Количество взаимодействий</th>
                    </tr>
                </thead>
                <tbody>
                    {#each $mostActiveUsersData as user (user.user_id)}
                        <tr>
                            <td>{user.user_id}</td>
                            <td>{user.username || '-'}</td>
                            <td>{user.first_name || '-'}</td>
                            <td>{user.last_name || '-'}</td>
                            <td>{user.interactionCount}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {:else}
        <p class="info-message">Нет данных о самых активных пользователях за выбранный период.</p>
    {/if}
</section>

<style>
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

    h3 {
        color: var(--main-text);
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
        font-size: 1.25rem;
    }

    section {
        margin-bottom: 2.5rem;
        padding: 2rem;
        border: 1px solid var(--border-gray);
        border-radius: 10px;
        background-color: var(--first-color);
        color: var(--main-text);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        width: 100%;
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
    input[type='number'],
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

    .loading-content {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 1rem;
    }

    p {
        color: var(--main-text);
    }

    p strong {
        color: var(--decor-green);
    }

    .table-container {
        max-height: 400px;
        overflow-y: auto;
        border: 1px solid var(--border-gray);
        border-radius: 8px;
        background-color: var(--first-color);
        width: 100%;
        box-sizing: border-box;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        color: var(--main-text);
    }

    th,
    td {
        padding: 0.8rem;
        text-align: left;
        border-bottom: 1px solid var(--border-gray);
    }

    th {
        background-color: var(--second-color);
        font-weight: bold;
        position: sticky;
        top: 0;
        z-index: 1;
    }

    tbody tr:hover {
        background-color: rgba(255, 255, 255, 0.05);
    }

    .summary-content-placeholder {
        height: 120px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
    }

    .user-stats-card {
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
    }

    .user-stats-card .stat-value {
        font-size: 3.5rem;
        font-weight: bold;
        color: var(--decor-green);
        margin-bottom: 0.5rem;
        line-height: 1;
    }

    .user-stats-card .stat-label {
        font-size: 1.1rem;
        color: var(--gray-text);
    }
</style>