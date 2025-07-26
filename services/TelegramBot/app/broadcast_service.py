import asyncio
import logging
from aiogram import Bot
from aiogram.exceptions import TelegramAPIError
from app.storage.mongo_db import get_message_content, get_all_user_ids
# Импортируем правильную функцию для прямой отправки сообщений пользователю
from app.events.message_service import send_message_to_user_by_name

logger = logging.getLogger(__name__)

async def send_broadcast_message(broadcast_data: dict, bot_instance: Bot):
    """
    Отправляет широковещательное сообщение всем пользователям, используя send_message_to_user_by_name.
    broadcast_data ожидается в формате {'message_name': 'имя_сообщения'}.
    """
    message_name = broadcast_data.get("message_name")
    if not message_name:
        logger.error("В данных рассылки отсутствует 'message_name'. Невозможно отправить рассылку.")
        return

    user_ids = await get_all_user_ids()
    if not user_ids:
        logger.warning("Не найдено user_id в MongoDB для рассылки.")
        return

    logger.info(f"Начинаю рассылку сообщения '{message_name}' для {len(user_ids)} пользователей.")

    sent_count = 0
    blocked_count = 0
    error_count = 0

    for user_id in user_ids:
        try:
            # Теперь вызываем send_message_to_user_by_name, которая принимает bot, chat_id и user_id_for_logging
            await send_message_to_user_by_name(
                message_name=message_name,
                bot=bot_instance,
                chat_id=user_id,
                user_id_for_logging=user_id,
                context={}
            )
            sent_count += 1
            await asyncio.sleep(0.05)
        except TelegramAPIError as e:
            if "bot was blocked by the user" in str(e) or "user is deactivated" in str(e):
                logger.warning(f"Пользователь {user_id} заблокировал бота или деактивирован. Пропускаю.")
                blocked_count += 1
            else:
                logger.error(f"Ошибка Telegram API при отправке сообщения пользователю {user_id}: {e}")
                error_count += 1
        except Exception as e:
            logger.error(f"Неожиданная ошибка во время рассылки пользователю {user_id}: {e}")
            error_count += 1

    logger.info(f"Рассылка сообщения '{message_name}' завершена. Отправлено: {sent_count}, Заблокировано: {blocked_count}, Ошибки: {error_count}")

