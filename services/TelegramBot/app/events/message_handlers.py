from aiogram import Router
from aiogram.types import Message
from app.storage.mongo_db import read_data
from .message_service import send_message_by_name

router = Router()

@router.message()
async def message_handler(message: Message):
    """
    Обрабатывает входящие текстовые сообщения пользователей.

    Если пользователь находится в режиме ожидания ввода (waiting_for_input=True),
    сохраняет введённое значение в коллекцию `user_inputs`,
    сбрасывает состояние ожидания в `user_states`,
    затем ищет обработчик с паттерном `target/input/{input_var}`
    и отправляет сообщение, подставляя все введённые переменные из `user_inputs`.

    Если пользователь не в режиме ввода — обрабатывает сообщение
    согласно обычным паттернам из коллекции `handlers`.
    """
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
        handler = await handlers_collection.find_one({"pattern": pattern, "enabled": True})

        user_vars = {}
        cursor = user_inputs.find({"user_id": message.from_user.id})
        async for ui in cursor:
            var_name = ui.get("input_var")
            var_value = ui.get("value")
            if var_name and var_value is not None:
                user_vars[var_name] = var_value

        if handler:
            await send_message_by_name(handler["message_name"], message, context=user_vars)
        else:
            await message.answer("Ввод получен, но обработчик не найден.")
        return

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
            break
