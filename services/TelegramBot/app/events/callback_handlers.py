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


@router.callback_query()
async def callback_handler(callback: CallbackQuery):
    start = time.monotonic()
    logger.info(f"Получен callback_query от пользователя {callback.from_user.id}: {callback.data}")

    await log_user(callback.from_user)
    await callback.answer()
    logger.debug("Ответ на callback_query отправлен.")

    handlers_collection = await read_data("handlers")
    user_inputs = await read_data("user_inputs")
    user_states = await read_data("user_states")
    variables_collection = await read_data("variables")

    current_user_state = await user_states.find_one({"user_id": callback.from_user.id})

    selected_option_value = None
    try:
        potential_var_name = callback.data.split("/")[-1]
        variable_doc = await variables_collection.find_one({"name": potential_var_name})

        if variable_doc and "value" in variable_doc:
            selected_option_value = variable_doc["value"]
            logger.info(f"Из коллекции 'variables' получено значение: {selected_option_value} для '{potential_var_name}'")
        else:
            logger.warning(f"Переменная '{potential_var_name}' не найдена или не имеет поля 'value' в коллекции 'variables'.")
    except Exception as e:
        logger.error(f"Ошибка при извлечении значения из переменных по callback.data: {e}", exc_info=True)

    update_fields_for_state = {"last_callback_data": callback.data}
    if selected_option_value is not None:
        update_fields_for_state["selected_option"] = selected_option_value

    await user_states.update_one(
        {"user_id": callback.from_user.id},
        {"$set": update_fields_for_state},
        upsert=True
    )
    logger.info(f"В user_states для пользователя {callback.from_user.id} записано: {update_fields_for_state}")

    found_handler = False
    for handler in await handlers_collection.find({}).to_list(length=None):
        pattern = handler.get("pattern")
        if not pattern or not pattern.startswith("query/"):
            continue

        if callback.data == pattern:
            found_handler = True
            logger.info(f"Найден соответствующий обработчик для callback.data: {callback.data}")

            user_vars = await get_user_context_vars(callback.from_user.id, user_inputs, current_user_state)

            if selected_option_value is not None:
                user_vars["option"] = selected_option_value

            if handler.get("wait_input_var") is True:
                input_variable_name = handler.get("input_var", "input")
                await user_states.update_one(
                    {"user_id": callback.from_user.id},
                    {"$set": {"waiting_for_input": True, "input_var": input_variable_name}},
                    upsert=True
                )
                logger.info(f"Установлено ожидание ввода для переменной '{input_variable_name}' для пользователя {callback.from_user.id}.")
            
            message_to_send_name = handler.get("message_name")
            if message_to_send_name:
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