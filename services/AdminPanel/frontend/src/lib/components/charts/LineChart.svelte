<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';

    export let data = [];
    export let label = 'Количество кликов';
    export let title = 'Статистика кликов по времени';
    export let yAxisMax = null; // Новый пропс для максимального значения оси Y

    let canvas;
    let chartInstance = null;

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
                    borderColor: '#007acc',
                    backgroundColor: 'rgba(0, 122, 204, 0.2)',
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
                        color: 'black',
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
                            color: 'black'
                        },
                        ticks: {
                            color: 'black'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Количество',
                            color: 'black'
                        },
                        beginAtZero: true,
                        max: yAxisMax,
                        ticks: {
                            color: 'black'
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

<div style="width: 100%; height: 300px;">
    <canvas bind:this={canvas}></canvas>
</div>
