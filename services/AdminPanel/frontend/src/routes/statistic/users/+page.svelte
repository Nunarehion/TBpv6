<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	import LineChart from '$lib/components/charts/LineChart.svelte';

	const totalUsersStatistics = writable(null);
	const loadingTotalUsersStatistics = writable(false);
	const newUsersTimeSeriesData = writable([]);
	const loadingNewUsersTimeSeriesData = writable(false);
	const activeUsersTimeSeriesData = writable([]);
	const loadingActiveUsersTimeSeriesData = writable(false);
	const mostActiveUsersData = writable([]);
	const loadingMostActiveUsersData = writable(false);
	const apiError = writable(null);

	let startDate = $state('');
	let endDate = $state('');
	let interval = $state('day');

	let mostActiveUsersLimit = $state(10);

	let showLoadingMessage = $state(false);

	const registeredLoadFunctions = [];

	const registerLoadFunction = (func) => {
		registeredLoadFunctions.push(func);
	};

	function getAdjustedStartDateIso(dateString) {
		if (!dateString) return '';
		const parts = dateString.split('-').map(Number);
		const dt = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0));
		return dt.toISOString();
	}

	function getAdjustedEndDateIso(dateString) {
		if (!dateString) return '';
		const parts = dateString.split('-').map(Number);
		const dt = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999));
		return dt.toISOString();
	}

	async function fetchTotalUsersStatistics(startIso, endIso) {
		loadingTotalUsersStatistics.set(true);
		apiError.set(null);
		try {
			const url = `/api/statistics/users/total?startDate=${startIso}&endDate=${endIso}`;
			const response = await fetch(url);
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Ошибка загрузки общей статистики пользователей');
			}
			const data = await response.json();
			totalUsersStatistics.set(data);
		} catch (err) {
			apiError.set(err.message);
			totalUsersStatistics.set(null);
		} finally {
			loadingTotalUsersStatistics.set(false);
		}
	}

	async function fetchNewUsersTimeSeries(startIso, endIso, backendInterval) {
		loadingNewUsersTimeSeriesData.set(true);
		apiError.set(null);
		try {
			const url = `/api/statistics/users/new-over-time?startDate=${startIso}&endDate=${endIso}&interval=${backendInterval}`;
			const response = await fetch(url);
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Ошибка загрузки временного ряда новых пользователей');
			}
			const data = await response.json();
			newUsersTimeSeriesData.set(data);
		} catch (err) {
			apiError.set(err.message);
			newUsersTimeSeriesData.set([]);
		} finally {
			loadingNewUsersTimeSeriesData.set(false);
		}
	}

	async function fetchActiveUsersTimeSeries(startIso, endIso, backendInterval) {
		loadingActiveUsersTimeSeriesData.set(true);
		apiError.set(null);
		try {
			const url = `/api/statistics/users/active-over-time?startDate=${startIso}&endDate=${endIso}&interval=${backendInterval}`;
			const response = await fetch(url);
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || 'Ошибка загрузки временного ряда активных пользователей'
				);
			}
			const data = await response.json();
			activeUsersTimeSeriesData.set(data);
		} catch (err) {
			apiError.set(err.message);
			activeUsersTimeSeriesData.set([]);
		} finally {
			loadingActiveUsersTimeSeriesData.set(false);
		}
	}

	async function fetchMostActiveUsers(startIso, endIso, limit) {
		loadingMostActiveUsersData.set(true);
		apiError.set(null);
		try {
			const url = `/api/statistics/users/most-active?startDate=${startIso}&endDate=${endIso}&limit=${limit}`;
			const response = await fetch(url);
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Ошибка загрузки самых активных пользователей');
			}
			const data = await response.json();
			mostActiveUsersData.set(data);
		} catch (err) {
			apiError.set(err.message);
			mostActiveUsersData.set([]);
		} finally {
			loadingMostActiveUsersData.set(false);
		}
	}

	async function loadAllStatistics() {
		apiError.set(null);

		const startIso = getAdjustedStartDateIso(startDate);
		const endIso = getAdjustedEndDateIso(endDate);

		if (
			!startIso ||
			!endIso ||
			isNaN(new Date(startIso).getTime()) ||
			isNaN(new Date(endIso).getTime())
		) {
			apiError.set('Пожалуйста, выберите корректные начальную и конечную даты.');
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
			await delayedLoad(fetchTotalUsersStatistics, startIso, endIso);
		});
		registerLoadFunction(async (startIso, endIso, currentInterval) => {
			await delayedLoad(fetchNewUsersTimeSeries, startIso, endIso, currentInterval);
		});
		registerLoadFunction(async (startIso, endIso, currentInterval) => {
			await delayedLoad(fetchActiveUsersTimeSeries, startIso, endIso, currentInterval);
		});
		registerLoadFunction(async (startIso, endIso) => {
			await delayedLoad(fetchMostActiveUsers, startIso, endIso, mostActiveUsersLimit);
		});

		await loadAllStatistics();
	});

	async function delayedLoad(func, ...args) {
		showLoadingMessage = true;
		const startTime = Date.now();
		await func(...args);
		const elapsedTime = Date.now() - startTime;
		const minDisplayTime = 300;

		if (elapsedTime < minDisplayTime) {
			await new Promise((resolve) => setTimeout(resolve, minDisplayTime - elapsedTime));
		}
		showLoadingMessage = false;
	}

	function generateFullDateRange(startIso, endIso, intervalType) {
		const dates = [];
		let currentUtcDate = new Date(startIso);
		const endUtcDateObj = new Date(endIso);

		if (['day', 'month'].includes(intervalType)) {
			currentUtcDate.setUTCHours(0, 0, 0, 0);
		}

		while (currentUtcDate <= endUtcDateObj) {
			dates.push(new Date(currentUtcDate));

			if (intervalType === 'hour') {
				currentUtcDate.setUTCHours(currentUtcDate.getUTCHours() + 1);
			} else if (intervalType === 'day') {
				currentUtcDate.setUTCDate(currentUtcDate.getUTCDate() + 1);
			} else if (intervalType === 'month') {
				currentUtcDate.setUTCMonth(currentUtcDate.getUTCMonth() + 1);
			} else {
				currentUtcDate.setUTCDate(currentUtcDate.getUTCDate() + 1);
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

		const startIso = getAdjustedStartDateIso(startDate);
		const endIso = getAdjustedEndDateIso(endDate);

		const fullRange = generateFullDateRange(startIso, endIso, currentInterval);

		const dataMap = new Map();
		rawData.forEach((item) => {
			dataMap.set(new Date(item.time).toISOString(), item.count);
		});

		const result = fullRange.map((date) => {
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

		const startIso = getAdjustedStartDateIso(startDate);
		const endIso = getAdjustedEndDateIso(endDate);

		const fullRange = generateFullDateRange(startIso, endIso, currentInterval);

		const dataMap = new Map();
		rawData.forEach((item) => {
			dataMap.set(new Date(item.time).toISOString(), item.count);
		});

		const result = fullRange.map((date) => {
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
		return Math.max(1, Math.ceil(maxCount + buffer + percentageBuffer));
	});

	let activeUsersYMax = $derived.by(() => {
		if (!aggregatedActiveUsersData || aggregatedActiveUsersData.length === 0) {
			return 10;
		}
		const maxCount = Math.max(...aggregatedActiveUsersData.map((d) => d.count));
		const buffer = 10;
		const percentageBuffer = maxCount * 0.1;
		return Math.max(1, Math.ceil(maxCount + buffer + percentageBuffer));
	});
</script>

<h1>Статистика Пользователей</h1>

<section class="stat-section control-panel">
	<div class="stats-controls-row">
		<div class="input-date-group">
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
		<div class="input-date-group">
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
		<div class="summary-content-placeholder">
			{#if $apiError}
				<p class="error-message">Ошибка: {$apiError}</p>
			{:else if $loadingTotalUsersStatistics || showLoadingMessage}
				<p class="info-message">Загрузка общей статистики пользователей...</p>
			{:else if $totalUsersStatistics && $totalUsersStatistics.count !== undefined}
				<div class="user-stats-card">
					<p class="stat-label">Общее количество уникальных пользователей</p>
					<p class="stat-value">{$totalUsersStatistics.count}</p>
				</div>
			{:else}
				<p class="info-message">
					Общая статистика пользователей пока не загружена. Выберите даты и нажмите "Обновить
					статистику".
				</p>
			{/if}
		</div>
	</div>
</section>

<section class="stat-section">
	<h2>Новые пользователи по времени (Линейный график)</h2>
	<div class="input-group-container">
		<label for="intervalNewUsers">Интервал:</label>
		<select id="intervalNewUsers" bind:value={interval} on:change={loadAllStatistics}>
			<option value="hour">По часам</option>
			<option value="day">По дням</option>
			<option value="month">По месяцам</option>
		</select>
	</div>
	<div class="chart-container">
		{#if $loadingNewUsersTimeSeriesData || showLoadingMessage}
			<p class="info-message">Загрузка данных для графика новых пользователей...</p>
		{:else if $apiError && aggregatedNewUsersData.length === 0}
			<p class="error-message">
				Ошибка загрузки данных для графика новых пользователей: {$apiError}
			</p>
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
			<option value="hour">По часам</option>
			<option value="day">По дням</option>
			<option value="month">По месяцам</option>
		</select>
	</div>
	<div class="chart-container">
		{#if $loadingActiveUsersTimeSeriesData || showLoadingMessage}
			<p class="info-message">Загрузка данных для графика активных пользователей...</p>
		{:else if $apiError && aggregatedActiveUsersData.length === 0}
			<p class="error-message">
				Ошибка загрузки данных для графика активных пользователей: {$apiError}
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

	{#if $apiError}
		<p class="error-message">Ошибка: {$apiError}</p>
	{:else if $loadingMostActiveUsersData || showLoadingMessage}
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
		box-sizing: border-box;
	}
	section.control-panel {
		padding: 1rem;
		display: flex;
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
		white-space: nowrap;
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
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		padding: 0;
		flex-grow: 1;
	}

	.user-stats-card {
		display: flex;
		background-color: var(--second-color);
		border: 1px solid var(--border-gray);
		border-radius: 8px;
		padding: 0.5rem 1rem;
		display: flex;
		align-items: center;
		gap: 0.1rem;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		max-width: 150px;
		width: 100%;
		box-sizing: border-box;
	}

	.user-stats-card .stat-value {
		display: block;
		font-size: 2rem;
		margin-right: 1rem;
		font-weight: bold;
		color: var(--decor-green);
		margin-bottom: 0.1rem;
		line-height: 1;
	}

	.user-stats-card .stat-label {
		display: block;
		font-size: 0.75rem;
		color: var(--gray-text);
		text-align: left;
		line-height: 1.1;
	}

	.stats-controls-row {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		align-items: flex-end;
		justify-content: center;
		margin-bottom: 1.5rem;
	}

	.input-date-group {
		display: flex;
		flex-direction: column;
		flex-basis: 150px;
		flex-grow: 1;
		max-width: 180px;
	}

	.input-date-group input[type='date'] {
		width: 100%;
		min-width: 120px;
	}

	.stats-controls-row .update-button {
		flex-basis: auto;
		flex-grow: 0;
		max-width: 180px;
		min-width: 120px;
		height: 40px;
		padding: 0.5rem 1rem;
		margin-bottom: 0;
		white-space: nowrap;
	}

	.stats-controls-row .summary-content-placeholder {
		flex-basis: 100px;
		flex-grow: 0;
		max-width: 150px;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0;
	}

	@media (min-width: 850px) {
		.stats-controls-row {
			flex-wrap: nowrap;
			justify-content: center;
			align-items: flex-end;
		}

		.input-date-group {
			flex-basis: auto;
			flex-grow: 0;
			width: 180px;
		}

		.stats-controls-row .update-button {
			height: 40px;
			margin-bottom: 0;
		}

		.stats-controls-row .summary-content-placeholder {
			min-width: 150px;
			max-width: 150px;
		}
	}

	@media (max-width: 849px) {
		.stats-controls-row {
			justify-content: center;
		}
		.input-date-group,
		.update-button,
		.summary-content-placeholder {
			margin-bottom: 10px;
		}
	}
</style>
