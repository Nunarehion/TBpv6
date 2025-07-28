<script>
	import { onMount, getContext } from 'svelte';
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
		fetchMostActiveUsers
	} from '$lib/stores/db.js';

	import LineChart from '$lib/components/charts/LineChart.svelte';

	const {
		startDate,
		endDate,
		loadAllStatistics,
		registerLoadFunction,
		interval: contextInterval
	} = getContext('statsContext');
	const { error } = getContext('statsContext');

	let interval = $state(contextInterval);

	let mostActiveUsersLimit = $state(10);

	onMount(async () => {
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

	function getAdjustedEndDateIso(dateString) {
		if (!dateString) return '';
		const dt = new Date(dateString);
		dt.setHours(23, 59, 59, 999);
		return dt.toISOString();
	}

	function isValidDate(dateString) {
		if (!dateString) return false;
		const date = new Date(dateString);
		return !isNaN(date.getTime());
	}

	async function loadTotalUsersStats(startIso, endIso) {
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
		await fetchTotalUsersStatistics(startIso, adjustedEndIso);
	}

	async function loadNewUsersTimeSeriesStats(startIso, endIso, currentInterval) {
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
		await fetchNewUsersTimeSeries(startIso, adjustedEndIso, backendInterval);
	}

	async function loadActiveUsersTimeSeriesStats(startIso, endIso, currentInterval) {
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
		await fetchActiveUsersTimeSeries(startIso, adjustedEndIso, backendInterval);
	}

	async function loadMostActiveUsersStats(startIso, endIso, limit) {
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
		await fetchMostActiveUsers(startIso, adjustedEndIso, limit);
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

	let aggregatedNewUsersData = $derived.by(() => {
		if (['second', 'minute', 'hour', 'day', 'month'].includes(interval)) {
			return $newUsersTimeSeriesData;
		}
		return aggregateData($newUsersTimeSeriesData, interval);
	});

	let aggregatedActiveUsersData = $derived.by(() => {
		if (['second', 'minute', 'hour', 'day', 'month'].includes(interval)) {
			return $activeUsersTimeSeriesData;
		}
		return aggregateData($activeUsersTimeSeriesData, interval);
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
			<input type="date" id="statStartDate" value={startDate} on:change={loadAllStatistics} />
		</div>
		<div>
			<label for="statEndDate">Конечная дата:</label>
			<input type="date" id="statEndDate" value={endDate} on:change={loadAllStatistics} />
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
