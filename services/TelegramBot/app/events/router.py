from aiogram import Router, types
from aiogram.types import Message, CallbackQuery, InputMediaPhoto
from ..storage.mongo_db import read_data
from .keyboard_builder import get_keyboard_by_name, build_inline_keyboard

router = Router()

async def get_message_by_name(name):
    collection = await read_data("message")
    return await collection.find_one({"name": name})

async def send_message_by_name(message_name: str, target: Message | types.Message):
    message_data = await get_message_by_name(message_name)
    if not message_data:
        return

    images = message_data.get("images", [])
    text = message_data.get("text", "")

    markup = None
    if len(images) <= 1:
        keyboard_data = await get_keyboard_by_name(message_data.get("keyboard_name"))
        markup = await build_inline_keyboard(keyboard_data) if keyboard_data else None

    if len(images) == 1:
        await target.answer_photo(
            photo=images[0],
            caption=text,
            reply_markup=markup
        )
    elif len(images) > 1:
        media = [
            InputMediaPhoto(media=url, caption=text if i == 0 else "")
            for i, url in enumerate(images)
        ]
        await target.answer_media_group(media)
    else:
        await target.answer(text=text, reply_markup=markup)


@router.message()
async def message_handler(message: Message):
    handlers_collection = await read_data("handlers")
    handlers = await handlers_collection.find({}).to_list(None)

    for handler in handlers:
        if handler["pattern"].startswith("/query"):
            continue

        if message.text == handler["pattern"]:
            await send_message_by_name(handler["message_name"], message)
            break


@router.callback_query()
async def callback_handler(callback: CallbackQuery):
    handlers_collection = await read_data("handlers")
    handlers = await handlers_collection.find({}).to_list(None)

    for handler in handlers:
        pattern = handler["pattern"]

        if not pattern.startswith("query/"):
            continue  # Это не callback, пропускаем

        if callback.data == pattern:
            await send_message_by_name(handler["message_name"], callback.message)
            await callback.answer()
            break
