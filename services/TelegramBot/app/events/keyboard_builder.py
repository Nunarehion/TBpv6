
from aiogram import types
from bson import ObjectId
import re

url_pattern = re.compile(r'^(https?://|www\.)[^\s/$.?#].[^\s]*$')

async def get_button_by_id(button_id):
    from ..storage.mongo_db import read_data
    collection = await read_data("buttons")
    return await collection.find_one({"_id": ObjectId(button_id)})

async def get_keyboard_by_name(name):
    from ..storage.mongo_db import read_data
    collection = await read_data("keyboards")
    return await collection.find_one({"name": name})

async def build_inline_keyboard(keyboard_data):
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
    return types.InlineKeyboardMarkup(inline_keyboard=keyboard)
