<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';

    let { data = [], title = 'Клики по паттернам' } = $props();

    let canvas;
    let chartInstance = null;

    let visibility = $state({});

    const grayTextColor =
        getComputedStyle(document.documentElement).getPropertyValue('--gray-text').trim() || '#9ca3af';
    const mainTextColor =
        getComputedStyle(document.documentElement).getPropertyValue('--main-text').trim() || '#ffffff';
    const secondColor =
        getComputedStyle(document.documentElement).getPropertyValue('--second-color').trim() ||
        '#374151';
    const borderColor =
        getComputedStyle(document.documentElement).getPropertyValue('--border-gray').trim() ||
        '#4b556399';
    
    let chartColors = $derived(generateColors(data.length));

    function generateColors(numColors) {
        const colors = [];
        for (let i = 0; i < numColors; i++) {
            const hue = (i * 137.508) % 360;
            colors.push(`hsl(${hue}, 70%, 60%)`);
        }
        return colors;
    }
    
    let visibleData = $derived.by(() => {
        return data.filter((_, index) => visibility[index]);
    });

    $effect(() => {
        if (!canvas) {
            return;
        }

        if (chartInstance) {
            chartInstance.destroy();
        }

        const visibleColors = chartColors.filter((_, index) => visibility[index]);

        chartInstance = new Chart(canvas, {
            type: 'pie',
            data: {
                labels: visibleData.map((d) => d.pattern),
                datasets: [
                    {
                        data: visibleData.map((d) => d.count),
                        backgroundColor: visibleColors,
                        hoverOffset: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: title,
                        color: grayTextColor,
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        display: false
                    }
                }
            }
        });
    });

    onMount(() => {
        if (data.length > 0) {
            data.forEach((_, index) => {
                visibility[index] = true;
            });
        }
    });
</script>

<div class="main-wrapper">
    <div class="chart-wrapper">
        <canvas bind:this={canvas}></canvas>
    </div>
    <div class="legend-wrapper">
        <div class="legend-title">Параметры</div>
        {#each data as item, index}
            <label class="legend-item">
                <input
                    type="checkbox"
                    bind:checked={visibility[index]}
                />
                <span class="color-box" style="background-color: {chartColors[index]}"></span>
                <span>{item.pattern}</span>
            </label>
        {/each}
    </div>
</div>

<style>
    .main-wrapper {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 20px;
        background-color: var(--second-color);
        border-radius: 10px;
        padding: 1rem;
        box-sizing: border-box;
    }

    .chart-wrapper {
        flex: 1;
        height: 350px;
    }

    .legend-wrapper {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 10px;
        padding: 1rem;
        border-top: 1px solid var(--border-gray);
        color: var(--main-text);
        max-height: 250px;
        overflow-y: auto;
    }

    .legend-title {
        font-weight: bold;
        color: var(--gray-text);
        grid-column: 1 / -1; 
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
    }

    .color-box {
        width: 16px;
        height: 16px;
        border-radius: 4px;
    }
    
    /* Добавляем медиазапрос для адаптивности */
    @media (max-width: 768px) {
        .main-wrapper {
            /* На маленьких экранах элементы будут располагаться в столбец */
            flex-direction: column;
        }

        .chart-wrapper {
            /* Диаграмма займет 100% ширины и будет иметь фиксированную высоту */
            width: 100%;
            height: 300px;
        }
    }
</style>
