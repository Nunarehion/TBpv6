from aiogram import Router, types
from aiogram.types import Message, InputMediaPhoto
from ..storage.mongo_db import read_data
from .keyboard_builder import get_keyboard_by_name, build_inline_keyboard

router = Router()

async def get_message_by_name(name):
    collection = await read_data("message")
    return await collection.find_one({"name": name})

async def handle_dynamic_message(message: Message):
    handlers_collection = await read_data("handlers")
    handlers = await handlers_collection.find({}).to_list(None)

    for handler in handlers:
        if message.text == handler['pattern']:
            name = handler['message_name']
            message_data = await get_message_by_name(name)
            if not message_data:
                return

            images = message_data.get("images", [])
            text = message_data.get("text", "")

            if len(images) == 1:
                keyboard_data = await get_keyboard_by_name(message_data.get("keyboard_name"))
                markup = await build_inline_keyboard(keyboard_data) if keyboard_data else None

                await message.answer_photo(
                    photo=images[0],
                    caption=text,
                    reply_markup=markup
                )

            elif len(images) > 1:
                media = [
                    InputMediaPhoto(media=url, caption=text if i == 0 else "")
                    for i, url in enumerate(images)
                ]
                await message.answer_media_group(media)

            else:
                keyboard_data = await get_keyboard_by_name(message_data.get("keyboard_name"))
                markup = await build_inline_keyboard(keyboard_data) if keyboard_data else None

                await message.answer(text=text, reply_markup=markup)

            break

@router.message()
async def handler(message: Message):
    await handle_dynamic_message(message)
