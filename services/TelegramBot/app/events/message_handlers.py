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

async def get_user_context_vars(user_id, user_inputs_collection, current_user_state):
    context_vars = {}
    user_inputs_cursor = user_inputs_collection.find({"user_id": user_id})
    async for ui in user_inputs_cursor:
        var_name = ui.get("input_var")
        var_value = ui.get("value")
        if var_name and var_value is not None:
            context_vars[var_name] = var_value
    
    if current_user_state and "selected_option" in current_user_state:
        context_vars["option"] = current_user_state["selected_option"]
        logger.debug(f"Добавлена переменная 'option' из user_state: {current_user_state['selected_option']}")
    
    return context_vars


@router.message()
async def message_handler(message: Message):
    start = time.monotonic()
    await log_user(message.from_user)

    user_states = await read_data("user_states")
    handlers_collection = await read_data("handlers")
    user_inputs = await read_data("user_inputs")
    variables_collection = await read_data("variables")

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
            {"$set": {"waiting_for_input": False, "selected_option": None, "last_callback_data": None}}
        )

        pattern_to_match = f"target/input/{input_var}"
        
        user_vars = await get_user_context_vars(message.from_user.id, user_inputs, user_state)

        handler_for_input = await handlers_collection.find_one({"pattern": pattern_to_match})

        if handler_for_input:
            message_to_send_name = handler_for_input.get("message_name")
            if message_to_send_name:
                logger.info(f"Отправляю сообщение '{message_to_send_name}' после получения ввода для {input_var}.")
                await send_message_by_name(message_to_send_name, message, context=user_vars)
            else:
                logger.warning(f"Обработчик {pattern_to_match} не содержит 'message_name'. Сообщение не будет отправлено.")
        else:
            await message.answer("Ввод получен, но соответствующий обработчик не найден.")
        
        end = time.monotonic()
        latency_ms = (end - start) * 1000

        await log_interaction_event(
            user_id=message.from_user.id,
            chat_id=message.chat.id,
            pattern=pattern_to_match,
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
            user_vars = await get_user_context_vars(message.from_user.id, user_inputs, user_state)
            if handler.get("wait_input_var") is True:
                input_variable_name = handler.get("input_var", "input")
                await user_states.update_one(
                    {"user_id": message.from_user.id},
                    {"$set": {"waiting_for_input": True, "input_var": input_variable_name}},
                    upsert=True
                )
                logger.info(f"Установлено ожидание ввода для переменной '{input_variable_name}' для пользователя {message.from_user.id}")
            
            message_to_send_name = handler.get("message_name")
            if message_to_send_name:
                await send_message_by_name(message_to_send_name, message, context=user_vars)
            else:
                logger.warning(f"Обработчик {pattern} не содержит 'message_name'. Сообщение не будет отправлено.")

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
