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
		fetchMostActiveUsers,
		error
	} from '$lib/stores/db.js';

	import LineChart from '$lib/components/charts/LineChart.svelte';

	const { startDate, endDate, interval, loadAllStatistics, registerLoadFunction } =
		getContext('statsContext');

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
	});

	async function loadTotalUsersStats(startIso, endIso) {
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
		await fetchTotalUsersStatistics(startIso, endIso);
	}

	async function loadNewUsersTimeSeriesStats(startIso, endIso, currentInterval) {
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
		await fetchNewUsersTimeSeries(startIso, endIso, backendInterval);
	}

	async function loadActiveUsersTimeSeriesStats(startIso, endIso, currentInterval) {
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
		await fetchActiveUsersTimeSeries(startIso, endIso, backendInterval);
	}

	async function loadMostActiveUsersStats(startIso, endIso, limit) {
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
		await fetchMostActiveUsers(startIso, endIso, limit);
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
			<input
				type="datetime-local"
				id="statStartDate"
				value={startDate}
				on:change={loadAllStatistics}
			/>
		</div>
		<div>
			<label for="statEndDate">Конечная дата:</label>
			<input type="datetime-local" id="statEndDate" value={endDate} on:change={loadAllStatistics} />
		</div>
		<button on:click={loadAllStatistics} class="update-button"> Обновить статистику </button>
	</div>

	{#if $error}
		<p class="error-message">Ошибка: {$error}</p>
	{:else if $loadingTotalUsersStatistics}
		<p>Загрузка общей статистики пользователей...</p>
	{:else if $totalUsersStatistics && $totalUsersStatistics.count !== undefined}
		<h3>Результаты:</h3>
		<p><strong>Общее количество уникальных пользователей:</strong> {$totalUsersStatistics.count}</p>
		<p>
			<strong>Начальная дата:</strong>
			{new Date($totalUsersStatistics.startDate).toLocaleString()}
		</p>
		<p>
			<strong>Конечная дата:</strong>
			{new Date($totalUsersStatistics.endDate).toLocaleString()}
		</p>
	{:else}
		<p>
			Общая статистика пользователей пока не загружена. Выберите даты и нажмите "Обновить
			статистику".
		</p>
	{/if}
</section>

<section class="stat-section">
	<h2>Новые пользователи по времени (Линейный график)</h2>
	<div class="input-group-container">
		<label for="intervalNewUsers">Интервал:</label>
		<select id="intervalNewUsers" value={interval} on:change={loadAllStatistics}>
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
	{#if $loadingNewUsersTimeSeriesData}
		<p>Загрузка данных для графика новых пользователей...</p>
	{:else if $error && aggregatedNewUsersData.length === 0}
		<p class="error-message">Ошибка загрузки данных для графика новых пользователей: {$error}</p>
	{:else if aggregatedNewUsersData && aggregatedNewUsersData.length > 0}
		<div class="chart-container">
			<LineChart data={aggregatedNewUsersData} yAxisMax={newUsersYMax} />
		</div>
	{:else}
		<p>Нет данных для отображения графика новых пользователей за выбранный период.</p>
	{/if}
</section>

<section class="stat-section">
	<h2>Активные пользователи по времени (Линейный график)</h2>
	<div class="input-group-container">
		<label for="intervalActiveUsers">Интервал:</label>
		<select id="intervalActiveUsers" value={interval} on:change={loadAllStatistics}>
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
	{#if $loadingActiveUsersTimeSeriesData}
		<p>Загрузка данных для графика активных пользователей...</p>
	{:else if $error && aggregatedActiveUsersData.length === 0}
		<p class="error-message">Ошибка загрузки данных для графика активных пользователей: {$error}</p>
	{:else if aggregatedActiveUsersData && aggregatedActiveUsersData.length > 0}
		<div class="chart-container">
			<LineChart data={aggregatedActiveUsersData} yAxisMax={activeUsersYMax} />
		</div>
	{:else}
		<p>Нет данных для отображения графика активных пользователей за выбранный период.</p>
	{/if}
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
		<p>Загрузка списка самых активных пользователей...</p>
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
		<p>Нет данных о самых активных пользователях за выбранный период.</p>
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
	input[type='number'],
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

	.table-container {
		max-height: 400px; /* Ограничиваем высоту таблицы для скролла */
		overflow-y: auto;
		border: 1px solid #ddd;
		border-radius: 8px;
		background-color: white;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		color: black;
	}

	th,
	td {
		padding: 0.8rem;
		text-align: left;
		border-bottom: 1px solid #ddd;
	}

	th {
		background-color: #e9ecef;
		font-weight: bold;
		position: sticky;
		top: 0;
		z-index: 1;
	}

	tbody tr:hover {
		background-color: #f1f1f1;
	}
</style>
