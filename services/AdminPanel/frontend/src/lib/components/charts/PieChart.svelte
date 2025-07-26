<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';

    export let data = [];
    export let title = 'Клики по паттернам';

    let canvas;
    let chartInstance = null;

    function generateColors(numColors) {
        const colors = [];
        for (let i = 0; i < numColors; i++) {
            const hue = (i * 137.508) % 360;
            colors.push(`hsl(${hue}, 70%, 60%)`);
        }
        return colors;
    }

    function renderChart() {
        if (chartInstance) {
            chartInstance.destroy();
        }

        const labels = data.map(d => d.pattern);
        const counts = data.map(d => d.count);
        const backgroundColors = generateColors(labels.length);

        chartInstance = new Chart(canvas, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: counts,
                    backgroundColor: backgroundColors,
                    hoverOffset: 4
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
                        position: 'right',
                        labels: {
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

    $: if (data) {
        renderChart();
    }
</script>

<div class="chart-wrapper">
    <canvas bind:this={canvas}></canvas>
</div>

<style>
    .chart-wrapper {
        width: 100%;
        height: 300px;
    }
</style>
