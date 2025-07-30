import re
from typing import Optional
from bson import ObjectId
from aiogram import types

from app.storage.mongo_db import read_data 

url_pattern = re.compile(r'^(https?://|www\.)[^\s/$.?#].[^\s]*$')


async def get_button_by_id(button_id: str) -> Optional[dict]:
    """
    Получает данные кнопки из коллекции `buttons` по её ObjectId.

    :param button_id: Строковый ID кнопки (Mongo ObjectId).
    :return: Документ кнопки или None, если не найден.
    """
    collection = await read_data("buttons")
    return await collection.find_one({"_id": ObjectId(button_id)})


async def get_keyboard_by_name(name: str) -> Optional[dict]:
    """
    Получает данные клавиатуры из коллекции `keyboards` по имени.

    :param name: Имя клавиатуры.
    :return: Документ клавиатуры или None, если не найден.
    """
    collection = await read_data("keyboards")
    return await collection.find_one({"name": name})


async def build_inline_keyboard(keyboard_data: dict) -> types.InlineKeyboardMarkup:
    """
    Собирает инлайн-клавиатуру на основе структуры кнопок из базы данных.

    Каждая кнопка может содержать либо `callback_data`, либо URL.

    :param keyboard_data: Документ клавиатуры из MongoDB со списком ID кнопок.
    :return: Объект InlineKeyboardMarkup.
    """
    keyboard = []

    for row in keyboard_data.get("buttons", []):
        button_row = []

        for button_ref in row:
            button_id = button_ref.get("id")
            if not button_id:
                continue

            button_data = await get_button_by_id(button_id)
            if not button_data:
                continue

            text = button_data.get("text", "🔘")
            callback_data = button_data.get("callback_data")

            if callback_data:
                if url_pattern.match(callback_data):
                    button = types.InlineKeyboardButton(text=text, url=callback_data)
                else:
                    button = types.InlineKeyboardButton(text=text, callback_data=callback_data)
                button_row.append(button)

        if button_row:
            keyboard.append(button_row)

    return types.InlineKeyboardMarkup(inline_keyboard=keyboard)
