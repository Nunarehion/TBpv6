<script>    
</script>

<section class="main-section">
	<h1 class="main-title">Админ-панель Telegram-бота</h1>

	<div class="main-cards-grid">
		<a class="main-card" href="/messages">
			<svg class="main-card-icon"><use href="/sprite.svg#messages"></use></svg>
			<div class="main-card-title">Сообщения</div>
			<div class="main-card-desc">
				Создавайте, редактируйте и удаляйте шаблоны сообщений, управляйте клавиатурами и вложениями
				для рассылок.
			</div>
		</a>
		<a class="main-card" href="/statistic/trigers">
			<svg class="main-card-icon"><use href="/sprite.svg#chart-pie"></use></svg>
			<div class="main-card-title">Статистика</div>
			<div class="main-card-desc">
				Анализируйте активность пользователей, клики по паттернам, новые и активные пользователи за
				выбранный период.
			</div>
		</a>
		<a class="main-card" href="/newsletter">
			<svg class="main-card-icon"><use href="/sprite.svg#envelope-open"></use></svg>
			<div class="main-card-title">Рассылка</div>
			<div class="main-card-desc">
				Запускайте массовые рассылки выбранных сообщений всем пользователям или отдельным группам.
			</div>
		</a>
		<a class="main-card" href="/images">
			<svg class="main-card-icon"><use href="/sprite.svg#image"></use></svg>
			<div class="main-card-title">Картинки</div>
			<div class="main-card-desc">
				Загружайте, просматривайте и управляйте изображениями для использования в сообщениях бота.
			</div>
		</a>
	</div>
</section>

<style>
	.main-section {
		max-width: 950px;
		margin: 0 auto;
		padding: 3rem 1rem 0 1rem;
	}
	.main-title {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		margin-top: 0;
		margin-bottom: 3rem;
		color: var(--main-text, #fff);
		font-size: 2.7rem;
		letter-spacing: 0.03em;
		outline: none;
	}
	.main-description {
		text-align: center;
		color: var(--gray-text, #9ca3af);
		font-size: 1.15rem;
		margin-bottom: 2.5rem;
	}
	.main-cards-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 2.5rem;
	}
	.main-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		background: var(--second-color, #374151);
		border-radius: 18px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.13);
		text-decoration: none;
		color: var(--main-text, #fff);
		border: 1px solid var(--border-gray, #4b556399);
		padding: 2rem 1.2rem 1.5rem 1.2rem;
		min-height: 15rem;
		transition: box-shadow 0.15s;
	}
	.main-card-icon {
		width: 52px;
		height: 52px;
		margin-bottom: 1.2rem;
		fill: var(--gray-text, #9ca3af);
	}
	.main-card-title {
		font-weight: bold;
		font-size: 1.25rem;
		margin-bottom: 0.7rem;
		letter-spacing: 0.02em;
		text-align: center;
	}
	.main-card-desc {
		font-size: 1.02rem;
		color: var(--gray-text, #9ca3af);
		text-align: center;
	}
	@media (max-width: 900px) {
		.main-cards-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}
	}
</style>
