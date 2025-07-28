<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';

    export let data = [];
    export let title = 'Клики по паттернам';

    let canvas;
    let chartInstance = null;

    const grayTextColor = getComputedStyle(document.documentElement).getPropertyValue('--gray-text').trim() || '#9ca3af';
    const mainTextColor = getComputedStyle(document.documentElement).getPropertyValue('--main-text').trim() || '#ffffff';
    const secondColor = getComputedStyle(document.documentElement).getPropertyValue('--second-color').trim() || '#374151';
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-gray').trim() || '#4b556399';

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
                        color: grayTextColor,
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        position: 'right',
                        labels: {
                            color: mainTextColor
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
    :root {
        --first-color: #1F2A37;
        --second-color: #374151;
        --border-gray: #4b556399;
        --gray-text: #9ca3af;
        --main-text: #ffffff;
        --blue: #1a56db;
    }

    .chart-wrapper {
        width: 100%;
        height: 350px;
        background-color: var(--second-color);
        border-radius: 10px;
        padding: 1rem;
        box-sizing: border-box;
    }
</style>