<script>
    import { page } from '$app/stores';
</script>

<style>
    .error-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        text-align: center;
        padding: 2rem;
    }

    .error-code {
        font-size: 8rem;
        font-weight: bold;
        color: #dc3545;
        margin: 0;
    }

    .error-message {
        font-size: 2rem;
        margin-top: 1rem;
        color: #6c757d;
    }

    .back-link {
        margin-top: 2rem;
        font-size: 1.2rem;
        color: #007bff;
        text-decoration: none;
        border-bottom: 2px solid #007bff;
        padding-bottom: 2px;
    }

    .back-link:hover {
        color: #0056b3;
        border-color: #0056b3;
    }
</style>

<div class="error-container">
    <h1 class="error-code">{$page.status}</h1>
    <p class="error-message">{$page.error?.message}</p>
    <a href="/" class="back-link">Вернуться на главную</a>
</div>