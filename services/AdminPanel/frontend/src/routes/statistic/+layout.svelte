<script>
    import { setContext, onMount } from 'svelte';
    import { error } from '$lib/stores/db.js'; // Используем общий стор ошибок

    let startDate = $state('');
    let endDate = $state('');
    let interval = $state('hour'); // Общий интервал для временных рядов

    // Массив для хранения функций загрузки данных, которые будут регистрироваться дочерними компонентами
    const registeredLoadFunctions = [];

    /**
     * Регистрирует функцию загрузки данных от дочернего компонента.
     * @param {Function} func - Асинхронная функция, которая принимает startDate, endDate и interval.
     */
    const registerLoadFunction = (func) => {
        registeredLoadFunctions.push(func);
    };

    /**
     * Вспомогательная функция для корректировки конечной даты до конца дня/интервала.
     * @param {string} dateString - Строка даты.
     * @returns {string} - Скорректированная строка даты в формате ISO.
     */
    function getAdjustedEndDateIso(dateString) {
        if (!dateString) return '';
        const dt = new Date(dateString);
        dt.setSeconds(59);
        dt.setMilliseconds(999);
        return dt.toISOString();
    }

    /**
     * Запускает загрузку всех зарегистрированных статистических данных.
     */
    async function loadAllStatistics() {
        error.set(null); // Очищаем предыдущие ошибки
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

        // Запускаем все зарегистрированные функции загрузки данных
        for (const func of registeredLoadFunctions) {
            await func(startIso, endIso, interval); // Передаем даты и интервал
        }
    }

    // Объявляем derived-переменные отдельно
    let derivedStartDate = $derived(startDate);
    let derivedEndDate = $derived(endDate);
    let derivedInterval = $derived(interval);

    // Предоставляем контекст для дочерних компонентов
    setContext('statsContext', {
        startDate: derivedStartDate, // Передаем объявленные derived-переменные
        endDate: derivedEndDate,
        interval: derivedInterval,
        loadAllStatistics,
        registerLoadFunction,
        error // Передаем стор ошибок
    });

    // Инициализация дат при монтировании лейаута
    onMount(async () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);

        endDate = tomorrow.toISOString().slice(0, 16);

        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = sevenDaysAgo.toISOString().slice(0, 16);

        // Запускаем первоначальную загрузку данных после установки дат
        await loadAllStatistics();
    });
</script>

<div class="page-wrapper">
    <!-- Слот для содержимого дочерних страниц -->
    <slot />
</div>

<style>
    .page-wrapper {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem;
    }
</style>
