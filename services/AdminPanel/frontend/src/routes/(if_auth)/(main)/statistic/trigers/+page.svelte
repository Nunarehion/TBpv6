<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	import LineChart from '$lib/components/charts/LineChart.svelte';
	import PieChart from '$lib/components/charts/PieChart.svelte';

	const clickStatistics = writable(null);
	const loadingClickStatistics = writable(false);
	const timeSeriesData = writable([]);
	const loadingTimeSeriesData = writable(false);
	const clicksByPatternData = writable([]);
	const loadingClicksByPatternData = writable(false);
	const apiError = writable(null);

	let startDate = $state('');
	let endDate = $state('');
	let interval = $state('hour');

	let selectedPattern = $state('');

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

	async function fetchClickStatistics(startIso, endIso, pattern = null) {
		loadingClickStatistics.set(true);
		apiError.set(null);
		try {
			let url = `/api/statistics/clicks/total?startDate=${startIso}&endDate=${endIso}`;
			if (pattern) {
				url += `&pattern=${encodeURIComponent(pattern)}`;
			}
			const response = await fetch(url);
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Ошибка загрузки общей статистики кликов');
			}
			const data = await response.json();
			clickStatistics.set(data);
		} catch (err) {
			apiError.set(err.message);
			clickStatistics.set(null);
		} finally {
			loadingClickStatistics.set(false);
		}
	}

	async function fetchTimeSeriesClickStatistics(startIso, endIso, backendInterval) {
		loadingTimeSeriesData.set(true);
		apiError.set(null);
		try {
			const url = `/api/statistics/clicks/time-series?startDate=${startIso}&endDate=${endIso}&interval=${backendInterval}`;
			const response = await fetch(url);
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Ошибка загрузки временного ряда кликов');
			}
			const data = await response.json();
			timeSeriesData.set(data);
		} catch (err) {
			apiError.set(err.message);
			timeSeriesData.set([]);
		} finally {
			loadingTimeSeriesData.set(false);
		}
	}

	async function fetchClicksByPatternStatistics(startIso, endIso) {
		loadingClicksByPatternData.set(true);
		apiError.set(null);
		try {
			const url = `/api/statistics/clicks/by-pattern?startDate=${startIso}&endDate=${endIso}`;
			const response = await fetch(url);
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Ошибка загрузки кликов по паттернам');
			}
			const data = await response.json();
			clicksByPatternData.set(data);
		} catch (err) {
			apiError.set(err.message);
			clicksByPatternData.set([]);
		} finally {
			loadingClicksByPatternData.set(false);
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
			await delayedLoad(fetchClickStatistics, startIso, endIso, selectedPattern);
		});
		registerLoadFunction(async (startIso, endIso, currentInterval) => {
			await delayedLoad(fetchTimeSeriesClickStatistics, startIso, endIso, currentInterval);
		});
		registerLoadFunction(async (startIso, endIso) => {
			await delayedLoad(fetchClicksByPatternStatistics, startIso, endIso);
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

		if (['day', 'week', 'month', '3_days', '4_months'].includes(intervalType)) {
			currentUtcDate.setUTCHours(0, 0, 0, 0);
		}

		while (currentUtcDate <= endUtcDateObj) {
			dates.push(new Date(currentUtcDate));

			if (intervalType === 'minute') {
				currentUtcDate.setUTCMinutes(currentUtcDate.getUTCMinutes() + 1);
			} else if (intervalType === 'hour') {
				currentUtcDate.setUTCHours(currentUtcDate.getUTCHours() + 1);
			} else if (intervalType === 'day') {
				currentUtcDate.setUTCDate(currentUtcDate.getUTCDate() + 1);
			} else if (intervalType === 'month') {
				currentUtcDate.setUTCMonth(currentUtcDate.getUTCMonth() + 1);
			} else if (intervalType === '10_minutes') {
				currentUtcDate.setUTCMinutes(currentUtcDate.getUTCMinutes() + 10);
			} else if (intervalType === 'half_hour') {
				currentUtcDate.setUTCMinutes(currentUtcDate.getUTCMinutes() + 30);
			} else if (intervalType === '12_hours') {
				currentUtcDate.setUTCHours(currentUtcDate.getUTCHours() + 12);
			} else if (intervalType === '3_days') {
				currentUtcDate.setUTCDate(currentUtcDate.getUTCDate() + 3);
			} else if (intervalType === 'week') {
				currentUtcDate.setUTCDate(currentUtcDate.getUTCDate() + 7);
			} else if (intervalType === '4_months') {
				currentUtcDate.setUTCMonth(currentUtcDate.getUTCMonth() + 4);
			} else {
				currentUtcDate.setUTCDate(currentUtcDate.getUTCDate() + 1);
			}
		}
		return dates;
	}

	let aggregatedTimeSeriesData = $derived.by(() => {
		const rawData = $timeSeriesData;
		const currentInterval = interval;

		if (!startDate || !endDate || !rawData || rawData.length === 0) {
			return [];
		}

		const startIso = getAdjustedStartDateIso(startDate);
		const endIso = getAdjustedEndDateIso(endDate);

		const fullRange = generateFullDateRange(startIso, endIso, currentInterval);

		const dataMap = new Map();
		rawData.forEach((item) => {
			dataMap.set(item.time, item.count);
		});

		const result = fullRange.map((date) => {
			const isoString = date.toISOString();
			const count = dataMap.get(isoString) || 0;
			return { time: isoString, count: count };
		});

		return result;
	});

	let lineChartYMax = $derived.by(() => {
		if (!aggregatedTimeSeriesData || aggregatedTimeSeriesData.length === 0) {
			return 10;
		}

		const maxCount = aggregatedTimeSeriesData.reduce((max, d) => Math.max(max, d.count), 0);

		const buffer = 10;
		const percentageBuffer = maxCount * 0.1;

		return Math.max(1, Math.ceil(maxCount + buffer + percentageBuffer));
	});

	let pieChartData = $derived.by(() => {
		return $clicksByPatternData;
	});
</script>

<h1>Статистика Бота</h1>

<section class="stat-section">
	<h2>Статистика кликов по времени (Линейный график)</h2>
	<div class="input-group-container">
		<label for="interval">Интервал:</label>
		<select id="interval" bind:value={interval} on:change={loadAllStatistics}>
			<option value="minute">По минутам</option>
			<!-- <option value="10_minutes">По 10 минут</option> -->
			<!-- <option value="half_hour">По полчаса</option> -->
			<option value="hour">По часам</option>
			<option value="12_hours">По 12 часов</option>
			<option value="day">По дням</option>
		</select>
	</div>
	<div class="chart-container">
		{#if $loadingTimeSeriesData || showLoadingMessage}
			<p class="info-message transition-fade">Загрузка данных для линейного графика...</p>
		{:else if $apiError && aggregatedTimeSeriesData.length === 0}
			<p class="error-message transition-fade">
				Ошибка загрузки данных для линейного графика: {$apiError}
			</p>
		{:else if aggregatedTimeSeriesData && aggregatedTimeSeriesData.length > 0}
			<LineChart data={aggregatedTimeSeriesData} yAxisMax={lineChartYMax} />
		{:else}
			<p class="info-message transition-fade">
				Нет данных для отображения линейного графика за выбранный период.
			</p>
		{/if}
	</div>
</section>
<section class="stat-section">
	<h2>Общая статистика</h2>
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
		<div>
			<!-- <label for="statPattern">Паттерн (опционально):</label>
			<input
				type="text"
				id="statPattern"
				bind:value={selectedPattern}
				placeholder="Например, query/button_1"
				on:change={loadAllStatistics}
			/>
		</div> -->
			<button on:click={loadAllStatistics} class="update-button"> Обновить статистику </button>
		</div>

		<div class="summary-content-placeholder">
			{#if $apiError}
				<p class="error-message transition-fade">Ошибка: {$apiError}</p>
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
	</div>
</section>
<section class="stat-section">
	<h2>Статистика кликов по паттернам (Круговой график)</h2>
	<div class="input-group-container"></div>
	<div class="chart-container">
		{#if $loadingClicksByPatternData || showLoadingMessage}
			<p class="info-message transition-fade">Загрузка данных для кругового графика...</p>
		{:else if $apiError && pieChartData.length === 0}
			<p class="error-message transition-fade">
				Ошибка загрузки данных для кругового графика: {$apiError}
			</p>
		{:else if pieChartData && pieChartData.length > 0}
			<PieChart data={pieChartData} />
		{:else}
			<p class="info-message transition-fade">
				Нет данных для отображения кругового графика за выбранный период.
			</p>
		{/if}
	</div>
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

	section {
		display: flex;
		flex-direction: column;
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
