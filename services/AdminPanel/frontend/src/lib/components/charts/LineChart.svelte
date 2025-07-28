<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';

    export let data = [];
    export let label = 'Количество кликов';
    export let title = 'Статистика кликов по времени';
    export let yAxisMax = null;

    let canvas;
    let chartInstance = null;

    // Define colors using CSS custom properties for consistency
    const mainTextColor = getComputedStyle(document.documentElement).getPropertyValue('--main-text').trim() || '#ffffff';
    const grayTextColor = getComputedStyle(document.documentElement).getPropertyValue('--gray-text').trim() || '#9ca3af';
    const blueColor = getComputedStyle(document.documentElement).getPropertyValue('--blue').trim() || '#1a56db';
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-gray').trim() || '#4b556399';
    const secondColor = getComputedStyle(document.documentElement).getPropertyValue('--second-color').trim() || '#374151';


    function renderChart() {
        if (chartInstance) {
            chartInstance.destroy();
        }

        const labels = data.map(d => {
            return new Date(d.time).toLocaleString('ru-RU', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        });
        const counts = data.map(d => d.count);

        chartInstance = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: counts,
                    borderColor: blueColor,
                    backgroundColor: `rgba(${parseInt(blueColor.slice(1, 3), 16)}, ${parseInt(blueColor.slice(3, 5), 16)}, ${parseInt(blueColor.slice(5, 7), 16)}, 0.2)`, // Dynamic rgba from hex
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: title,
                        color: grayTextColor, // Using CSS variable for chart title color
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Время',
                            color: grayTextColor // Using CSS variable for X-axis title color
                        },
                        ticks: {
                            color: mainTextColor // Using CSS variable for X-axis tick color
                        },
                        grid: {
                            color: borderColor // Using CSS variable for X-axis grid color
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Количество',
                            color: grayTextColor // Using CSS variable for Y-axis title color
                        },
                        beginAtZero: true,
                        max: yAxisMax,
                        ticks: {
                            color: mainTextColor // Using CSS variable for Y-axis tick color
                        },
                        grid: {
                            color: borderColor // Using CSS variable for Y-axis grid color
                        }
                    }
                }
            }
        });
    }

    onMount(() => {
        renderChart();
    });

    $: if (data || yAxisMax !== null) {
        renderChart();
    }
</script>

<div class="chart-wrapper">
    <canvas bind:this={canvas}></canvas>
</div>

<style>


    .chart-wrapper {
        width: 100%;
        height: 350px;
        background-color: var(--second-color);
        border-radius: 10px;
        padding: 1rem;
        box-sizing: border-box;
    }
</style>