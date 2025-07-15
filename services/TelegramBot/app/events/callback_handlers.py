from aiogram import Router
from aiogram.types import CallbackQuery
from app.storage.mongo_db import read_data
from .message_service import send_message_by_name

router = Router()

@router.callback_query()
async def callback_handler(callback: CallbackQuery):
    """
    Обрабатывает входящие callback-запросы от инлайн-кнопок.

    Если в Mongo-документе handler указано `"wait_input_var": true`,
    переключает пользователя в режим ожидания ввода и сохраняет состояние в Mongo.

    Иначе отправляет сообщение по имени `message_name`.
    """
    handlers_collection = await read_data("handlers")
    handlers = await handlers_collection.find({}).to_list(length=None)

    for handler in handlers:
        pattern = handler.get("pattern")
        if not pattern or not pattern.startswith("query/"):
            continue

        if callback.data == pattern:
            if handler.get("wait_input_var") is True:
                user_states = await read_data("user_states")
                await callback.message.answer("Test 2:")
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

            await send_message_by_name(handler["message_name"], callback.message)
            await callback.answer()
            break
