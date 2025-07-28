import time
from datetime import datetime
from aiogram import Router
from aiogram.types import Message, CallbackQuery
from app.storage.mongo_db import read_data
from .message_service import send_message_by_name
from .statistics import log_user, log_interaction_event
import logging

logger = logging.getLogger(__name__)

router = Router()

@router.message()
async def message_handler(message: Message):
    start = time.monotonic()

    await log_user(message.from_user)

    user_states = await read_data("user_states")
    handlers_collection = await read_data("handlers")
    user_inputs = await read_data("user_inputs")

    user_state = await user_states.find_one({"user_id": message.from_user.id})

    if user_state and user_state.get("waiting_for_input"):
        input_var = user_state.get("input_var", "input")
        input_value = message.text

        await user_inputs.update_one(
            {"user_id": message.from_user.id, "input_var": input_var},
            {"$set": {"value": input_value}},
            upsert=True
        )

        await user_states.update_one(
            {"user_id": message.from_user.id},
            {"$set": {"waiting_for_input": False}}
        )

        pattern = f"target/input/{input_var}"

        user_vars = {}
        cursor = user_inputs.find({"user_id": message.from_user.id})
        async for ui in cursor:
            var_name = ui.get("input_var")
            var_value = ui.get("value")
            if var_name and var_value is not None:
                user_vars[var_name] = var_value

        handler = await handlers_collection.find_one({"pattern": pattern})

        if handler:
            await send_message_by_name(handler["message_name"], message, context=user_vars)
        else:
            await message.answer("Ввод получен, но обработчик не найден.")
        
        end = time.monotonic()
        latency_ms = (end - start) * 1000

        await log_interaction_event(
            user_id=message.from_user.id,
            chat_id=message.chat.id,
            pattern=pattern,
            latency_ms=latency_ms,
            timestamp=datetime.utcnow()
        )
        return

    handlers = await handlers_collection.find({}).to_list(length=None)

    for handler in handlers:
        pattern = handler.get("pattern")
        if not pattern or pattern.startswith("query/"):
            continue

        if message.text == pattern:
            user_vars = {}
            cursor = user_inputs.find({"user_id": message.from_user.id})
            async for ui in cursor:
                var_name = ui.get("input_var")
                var_value = ui.get("value")
                if var_name and var_value is not None:
                    user_vars[var_name] = var_value

            await send_message_by_name(handler["message_name"], message, context=user_vars)

            end = time.monotonic()
            latency_ms = (end - start) * 1000

            await log_interaction_event(
                user_id=message.from_user.id,
                chat_id=message.chat.id,
                pattern=pattern,
                latency_ms=latency_ms,
                timestamp=datetime.utcnow()
            )
            break

@router.callback_query()
async def callback_handler(callback: CallbackQuery):
    start = time.monotonic()
    logger.info(f"Получен callback_query от пользователя {callback.from_user.id}: {callback.data}")

    await log_user(callback.from_user)

    await callback.answer()
    logger.debug("Ответ на callback_query отправлен.")

    handlers_collection = await read_data("handlers")
    user_inputs = await read_data("user_inputs")

    handlers = await handlers_collection.find({}).to_list(length=None)
    logger.info(f"Загружено {handlers} активных обработчиков из DB.")
    logger.info(f"________ {callback.data} ____________")
    print(callback.data)
    found_handler = False
    for handler in handlers:
        pattern = handler.get("pattern")
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
            break
    
    if not found_handler:
        logger.warning(f"Не найден обработчик для callback.data: {callback.data}. Возможно, кнопка не соответствует ни одному паттерну.")
