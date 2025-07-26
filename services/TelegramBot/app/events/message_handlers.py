import time
from datetime import datetime
from aiogram import Router
from aiogram.types import Message
from app.storage.mongo_db import read_data
from .message_service import send_message_by_name
from .statistics import log_user, log_interaction_event

router = Router()

@router.message()
async def message_handler(message: Message):
    """
    Обрабатывает входящие текстовые сообщения пользователей с замером времени и логированием.
    """
    start = time.monotonic() # Начало замера времени

    await log_user(message.from_user) # Логируем информацию о пользователе в самом начале

    user_states = await read_data("user_states")
    handlers_collection = await read_data("handlers")
    user_inputs = await read_data("user_inputs")

    user_state = await user_states.find_one({"user_id": message.from_user.id})

    # Обработка состояния ожидания ввода
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

        handler = await handlers_collection.find_one({"pattern": pattern, "enabled": True})

        if handler:
            await send_message_by_name(handler["message_name"], message, context=user_vars)
        else:
            await message.answer("Ввод получен, но обработчик не найден.")
        
        end = time.monotonic() # Конец замера времени
        latency_ms = (end - start) * 1000

        # Логируем событие ПОСЛЕ завершения обработки и замера задержки
        await log_interaction_event(
            user_id=message.from_user.id,
            chat_id=message.chat.id,
            pattern=pattern,
            latency_ms=latency_ms,
            timestamp=datetime.utcnow()
        )
        return

    # Обработка обычных текстовых сообщений, соответствующих паттернам
    handlers = await handlers_collection.find({"enabled": True}).to_list(length=None)

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

            end = time.monotonic() # Конец замера времени
            latency_ms = (end - start) * 1000

            # Логируем событие ПОСЛЕ завершения обработки и замера задержки
            await log_interaction_event(
                user_id=message.from_user.id,
                chat_id=message.chat.id,
                pattern=pattern,
                latency_ms=latency_ms,
                timestamp=datetime.utcnow()
            )
            break # Выходим из цикла после нахождения первого совпадения
