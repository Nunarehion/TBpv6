from aiogram import Router
from aiogram.types import Message
from aiogram.filters import Command

import re
from aiogram import types

from ..storage.redis_cache import (wMessage, rMessage, listen_to_redis_updates)
from ..storage.mongo_db import (upsert_data, read_data)

router = Router()


# @router.message(Command("start"))
# async def start_handler(message: Message):
#     await message.answer(f'{rMessage("test_message")}')


@router.message(Command("dump"))
async def dump_handler(message: Message):
    await message.answer("Тест2")
    data = await read_data("message")
    if not data:
        await message.answer("База пуста.")
    else:
        # Отправим первые 5 документов (или все, если меньше)
        text = "\n\n".join([str(doc) for doc in data[:5]])  
        await message.answer(f"Данные из базы ррр:\n\n{text}")

# @router.message()
# async def echo_handler(message: Message):
#     """Эхо + сохранить в MongoDB"""
#     # Сохраняем сообщение в базу
#     await upsert_data({
#         "name": f"user_{message.from_user.id}",
#         "message": message.text,
#         "user_id": message.from_user.id,
#         "username": message.from_user.username,
#     })

#     await message.answer(f"Вы написали: {message.text}")

        
        
from aiogram import types
from bson import ObjectId

async def get_keyboard_by_name(name):
    collection = await read_data("keyboards")
    document = await collection.find_one({"name": name})
    return document

async def get_message_by_name(name):
    collection = await read_data("message")
    document = await collection.find_one({"name": name})
    return document

async def get_button_by_id(button_id):
    collection = await read_data("buttons")
    document = await collection.find_one({"_id": ObjectId(button_id)})
    return document


url_pattern = re.compile(
    r'^(https?://|www\.)[^\s/$.?#].[^\s]*$'
)

@router.message()
async def handler(message: Message):
    handlers_collection = await read_data("handlers")
    handlers = await handlers_collection.find({}).to_list(None)
    for handler in handlers:
        if message.text == handler['pattern']:
            name = handler['message_name']
            message_data = await get_message_by_name(name)
            if message_data:
                keyboard_data = await get_keyboard_by_name(message_data['keyboard_name'])
                if keyboard_data:
                    keyboard = []
                    for row in keyboard_data['buttons']:
                        button_row = []
                        for button_id in row:
                            button_data = await get_button_by_id(button_id['id']) 
                            if button_data:
                                callback_data = button_data.get('callback_data')
                                if callback_data and url_pattern.match(callback_data):
                                    button_row.append(types.InlineKeyboardButton(
                                        text=button_data['text'],
                                        url=callback_data
                                    ))
                                elif callback_data:
                                    button_row.append(types.InlineKeyboardButton(
                                        text=button_data['text'],
                                        callback_data=callback_data
                                    ))
                        keyboard.append(button_row)
                    inline_keyboard = types.InlineKeyboardMarkup(inline_keyboard=keyboard)
                    await message.answer(message_data['text'], reply_markup=inline_keyboard)
            break
