import time
from datetime import datetime
from aiogram import Router
from aiogram.types import CallbackQuery
from app.storage.mongo_db import read_data
from .message_service import send_message_by_name
from .statistics import log_user, log_interaction_event

router = Router()

@router.callback_query()
async def callback_handler(callback: CallbackQuery):
    """
    Обрабатывает входящие callback-запросы от инлайн-кнопок с замером времени и логированием.
    """
    start = time.monotonic()

    handlers_collection = await read_data("handlers")
    handlers = await handlers_collection.find({}).to_list(length=None)

    for handler in handlers:
        pattern = handler.get("pattern")
        if not pattern or not pattern.startswith("query/"):
            continue

        if callback.data == pattern:
            # Логируем взаимодействие с нулевой задержкой, пока не отправили сообщение
            await log_interaction_event(
                callback.from_user.id,
                callback.message.chat.id,
                pattern,
                latency_ms=0,
                timestamp=datetime.utcnow()
            )

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

            end = time.monotonic()
            latency_ms = (end - start) * 1000

            # Здесь можно логировать latency, например, отдельной функцией:
            # await log_latency(callback.from_user.id, latency_ms)

            break
