<script>
    import '$lib/reset.css';
    import '$lib/fonts.css';
    import '$lib/global.css';

    import SideBar from '$lib/components/SideBar.svelte';
    import { onMount } from 'svelte';
    import { navigating } from '$app/stores';

    let name = 'world';
    let sidebarOpen = false;

    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
    }

    onMount(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                sidebarOpen = true;
            } else {
                sidebarOpen = false;
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    });

    $: if ($navigating && window.innerWidth < 768) {
        sidebarOpen = false;
    }

    let config = [
        {
            header: 'Конструктор',
            icon: 'cog',
            items: [
                { text: 'Сообщения', link: '/messages', icon: 'messages' },
                { text: 'Кнопки', link: '/buttons', icon: 'circle-plus' },
                { text: 'Тригеры', link: '/handlers', icon: 'fire' },
                { text: 'Переменные', link: '/variables', icon: 'terminal' },
                { text: 'Клавиатура', link: '/keyboards', icon: 'terminal' }
            ]
        },
        {
            header: 'Рассылка',
            icon: 'paper-plane',
            items: [{ text: 'Рассылка', link: '/newsletter', icon: 'envelope-open' }]
        },
        {
            header: 'Статистика',
            icon: 'chart-pie',
            items: [
                { text: 'Тригеры', link: '/statistic/trigers', icon: 'bell-ring' },
                { text: 'Пользователи', link: '/statistic/users', icon: 'briefcase' }
            ]
        },
        {
            header: 'Управление',
            icon: 'adjustments-vertical',
            items: [
                { text: 'Пользователи', link: '/users', icon: 'desktop-pc' },
                { text: 'Иконки', link: '/icones', icon: 'palette' },
                { text: 'Картинки', link: '/images', icon: 'image' }
            ]
        }
    ];
</script>

<div class="wrap">
    {#if sidebarOpen}
        <div class="overlay" on:click={toggleSidebar}></div>
    {/if}

    <div class="hamburger-menu" on:click={toggleSidebar}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu">
            <line x1="4" x2="20" y1="12" y2="12"></line>
            <line x1="4" x2="20" y1="6" y2="6"></line>
            <line x1="4" x2="20" y1="18" y2="18"></line>
        </svg>
    </div>

    <nav></nav>
    <SideBar {config} bind:sidebarOpen />
    <div class="window">
        <slot />
    </div>
</div>

<style>
    :global(html),
    :global(body) {
        margin: 0;
        padding: 0;
        height: 100%;
        overflow: hidden;
    }

    .wrap {
        display: grid;
        grid-template-rows: max-content 1fr;
        background: var(--first-color);
        height: 100vh;
    }

    nav {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        background: var(--first-color);
        grid-column: 1 / -1;
        grid-row: 1 / 2;
    }

    .window {
        padding: 2rem;
        background-color: #1e2630;
        border: 1px solid var(--border-gray);
        grid-column: 1 / -1;
        grid-row: 2 / 3;
        overflow-y: auto;
    }

    .hamburger-menu {
        position: fixed;
        top: 1rem;
        left: 1rem;
        z-index: 1001;
        cursor: pointer;
        color: white;
    }

    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 999;
    }
    
    @media (min-width: 768px) {
        .wrap {
            grid-template-columns: 300px 1fr;
        }

        .hamburger-menu {
            display: none;
        }

        .overlay {
            display: none;
        }

        :global(.side-bar-container) {
            grid-column: 1 / 2;
            grid-row: 2 / 3;
            overflow-y: auto;
        }

        .window {
            grid-column: 2 / 3;
            grid-row: 2 / 3;
        }
    }
</style>