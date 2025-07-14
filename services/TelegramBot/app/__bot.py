import logging
from aiogram import Bot, Dispatcher

from app.config_reader import config
from app.events.router import router


# --- Telegram Bot ---
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

logger = logging.getLogger(__name__)


async def main():
    bot = Bot(token=config.TELEGRAM_BOT_TOKEN.get_secret_value())
    dp = Dispatcher()
    dp.include_router(router)
    
    await bot.delete_webhook(drop_pending_updates=True)
    logger.info("Бот запущен. Начинаю опрос...!!!!!!!")
    await dp.start_polling(bot)


