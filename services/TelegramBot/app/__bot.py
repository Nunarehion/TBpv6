import logging
import asyncio
from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from aiogram.client.bot import DefaultBotProperties

from app.events.router import router
from app.storage.mongo_db import get_bot_config, initialize_bot_config_if_not_exists
from app.storage.redis_db import start_redis_listener
from app.broadcast_service import send_broadcast_message

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

logger = logging.getLogger(__name__)

current_bot: Bot = None
current_dp: Dispatcher = None
last_bot_token: str = None

async def initialize_and_start_bot():
    global current_bot, current_dp, last_bot_token

    await initialize_bot_config_if_not_exists()

    bot_config = await get_bot_config()

    if not bot_config or not bot_config.get("bot_token"):
        logger.error("Токен бота не найден в конфигурации MongoDB. Запуск невозможен.")
        return False

    new_bot_token = bot_config["bot_token"]

    if current_bot and last_bot_token == new_bot_token:
        logger.debug("Токен бота не изменился. Продолжаю работу с текущим ботом.")
        return True

    if current_dp and current_bot:
        logger.info("Токен бота изменился. Останавливаю текущего бота...")
        try:
            await current_dp.stop_polling()
            logger.info("Текущий бот остановлен.")
        except Exception as e:
            logger.warning(f"Ошибка при остановке текущего бота: {e}")

    if bot_config.get("log_level"):
        logging.getLogger().setLevel(getattr(logging, bot_config["log_level"].upper(), logging.INFO))
        logger.info(f"Уровень логирования установлен на: {bot_config['log_level']}")

    default_properties = DefaultBotProperties(parse_mode=ParseMode.HTML)

    current_bot = Bot(
        token=new_bot_token,
        default=default_properties
    )
    current_dp = Dispatcher()
    current_dp.include_router(router)
    last_bot_token = new_bot_token

    async def redis_broadcast_handler(data: dict):
        await send_broadcast_message(data, current_bot)

    current_loop = asyncio.get_running_loop()
    asyncio.create_task(start_redis_listener("tbpv6_broadcast_channel", redis_broadcast_handler, current_loop))
    logger.info("Слушатель Redis запущен.")

    if bot_config.get("webhook_url") and bot_config.get("webhook_port"):
        logger.warning("Вебхук настроен в конфиге, но бот запускается в режиме long polling. Для вебхуков нужна дополнительная настройка веб-сервера.")
        await current_bot.delete_webhook(drop_pending_updates=True)
        logger.info("Бот запущен. Начинаю опрос...!!!!!!!")
        asyncio.create_task(current_dp.start_polling(current_bot))
    else:
        await current_bot.delete_webhook(drop_pending_updates=True)
        logger.info("Бот запущен. Начинаю опрос...!!!!!!!")
        asyncio.create_task(current_dp.start_polling(current_bot))

    return True

async def config_monitor():
    while True:
        logger.debug("Проверяю конфигурацию бота в MongoDB...")
        await initialize_and_start_bot()
        await asyncio.sleep(60)

async def main():
    if not await initialize_and_start_bot():
        logger.error("Не удалось запустить бота при первом запуске. Выход.")
        return

    asyncio.create_task(config_monitor())

    while True:
        await asyncio.sleep(3600)