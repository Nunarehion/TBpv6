import time
from datetime import datetime
from aiogram import Router
from aiogram.types import CallbackQuery
from app.storage.mongo_db import read_data
from .message_service import send_message_by_name
from .statistics import log_user, log_interaction_event
import logging # Импортируем модуль логирования

logger = logging.getLogger(__name__) # Получаем логгер для этого модуля

router = Router()

@router.callback_query()
async def callback_handler(callback: CallbackQuery):
    start = time.monotonic()
    logger.info(f"Получен callback_query от пользователя {callback.from_user.id}: {callback.data}")

    await log_user(callback.from_user)

    # Respond to the callback query immediately to remove the "blinking" and loading indicator on the button.
    await callback.answer()
    logger.debug("Ответ на callback_query отправлен.")

    handlers_collection = await read_data("handlers")
    user_inputs = await read_data("user_inputs")

    handlers = await handlers_collection.find({"enabled": True}).to_list(length=None)
    logger.info(f"Загружено {handlers} активных обработчиков из DB.")
    logger.info(f"________ {callback.data} ____________")
    print(callback.data)
    found_handler = False # Флаг для отслеживания, найден ли обработчик
    for handler in handlers:
        pattern = handler.get("pattern")
        # Skip patterns that do not start with "query/" or are empty,
        # as they are intended for text messages
        if not pattern or not pattern.startswith("query/"):
            logger.debug(f"Пропускаю обработчик с паттерном: {pattern} (не 'query/' или пустой).")
            continue

        if callback.data == pattern:
            found_handler = True
            logger.info(f"Найден соответствующий обработчик для callback.data: {callback.data}")

            user_vars = {}
            cursor = user_inputs.find({"user_id": callback.from_user.id})
            async for ui in cursor:
                var_name = ui.get("input_var")
                var_value = ui.get("value")
                if var_name and var_value is not None:
                    user_vars[var_name] = var_value
            logger.debug(f"Переменные пользователя для контекста: {user_vars}")

            if handler.get("wait_input_var") is True:
                print("wait_input_var")
                user_states = await read_data("user_states")
                logger.info(f"Устанавливаю состояние ожидания ввода для пользователя {callback.from_user.id}.")
                await user_states.update_one(
                    {"user_id": callback.from_user.id},
                    {
                        "$set": {
                            "waiting_for_input": True,
                            "input_var": "input",
                            "value": None,
                        }
                    },
                    upsert=True
                )
            else:
                logger.debug(f"Обработчик {pattern} не требует ожидания ввода.")

            message_to_send_name = handler.get("message_name")
            if message_to_send_name:
                logger.info(f"Отправляю сообщение по имени: {message_to_send_name}")
                await send_message_by_name(message_to_send_name, callback.message, context=user_vars)
            else:
                logger.warning(f"Обработчик {pattern} не содержит 'message_name'. Сообщение не будет отправлено.")

            end = time.monotonic()
            latency_ms = (end - start) * 1000

            await log_interaction_event(
                user_id=callback.from_user.id,
                chat_id=callback.message.chat.id,
                pattern=pattern,
                latency_ms=latency_ms,
                timestamp=datetime.utcnow()
            )
            logger.info(f"Обработка callback_query для {pattern} завершена за {latency_ms:.2f} мс.")
            break # Выходим из цикла после нахождения первого совпадения
    
    if not found_handler:
        logger.warning(f"Не найден обработчик для callback.data: {callback.data}. Возможно, кнопка не соответствует ни одному паттерну.")
        # Опционально: можно отправить пользователю сообщение, что действие не распознано
        # await callback.message.answer("Извините, это действие не распознано.")

