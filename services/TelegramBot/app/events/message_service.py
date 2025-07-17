import re
from aiogram import types
from aiogram.types import Message, InputMediaPhoto
from app.storage.mongo_db import read_data
from .keyboard_builder import get_keyboard_by_name, build_inline_keyboard
from .variables import get_all_variables
from .statistics import log_user, log_interaction_event

class SafeDict(dict):
    def __missing__(self, key):
        return "{" + key + "}"


async def get_message_by_name(name: str) -> dict | None:
    """
    Возвращает сообщение по имени из коллекции MongoDB.
    """
    collection = await read_data("message")
    return await collection.find_one({"name": name})


async def format_text_with_calculation(
    text: str,
    user_id: int,
    user_inputs_collection,
    extra_vars: dict = None
) -> str:
    """
    Подставляет пользовательские переменные и вычисляет выражения внутри фигурных скобок.
    """
    user_inputs_cursor = user_inputs_collection.find({"user_id": user_id})
    user_inputs_docs = await user_inputs_cursor.to_list(length=None)
    user_vars = {doc["input_var"]: doc["value"] for doc in user_inputs_docs}

    safe_vars = {}
    for k, v in user_vars.items():
        try:
            safe_vars[k] = float(v)
        except Exception:
            safe_vars[k] = v

    if extra_vars:
        safe_vars.update(extra_vars)

    def eval_expression(expr: str) -> str:
        """Вычисляет выражение expr с безопасным окружением."""
        safe_builtins = {
            "int": int,
            "float": float,
            "round": round,
            "min": min,
            "max": max,
            "abs": abs,
        }
        try:
            return str(eval(expr, {"__builtins__": None, **safe_builtins}, safe_vars))
        except Exception:
            return f"[Ошибка: {expr}]"


    pattern = re.compile(r"\{([^{}]+)\}")

    def replacer(match):
        expr = match.group(1)
        return eval_expression(expr)

    return pattern.sub(replacer, text)


async def send_message_by_name(
    message_name: str,
    target: Message | types.Message,
    context: dict = None
):
    """
    Загружает сообщение по имени и отправляет его пользователю с подстановкой и вычислениями.
    """
    message_data = await get_message_by_name(message_name)
    if not message_data:
        return

    images = message_data.get("images", [])
    raw_text = message_data.get("text", "")
    context = context or {}

    db_vars = await get_all_variables()
    all_vars = {**db_vars, **context}
    all_vars = {str(k): v for k, v in all_vars.items()}

    user_inputs_collection = await read_data("user_inputs")
    final_text = await format_text_with_calculation(raw_text, target.from_user.id, user_inputs_collection, extra_vars=all_vars)

    markup = None
    if len(images) <= 1:
        keyboard_data = await get_keyboard_by_name(message_data.get("keyboard_name"))
        markup = await build_inline_keyboard(keyboard_data) if keyboard_data else None

    if len(images) == 1:
        await target.answer_photo(photo=images[0], caption=final_text, reply_markup=markup, parse_mode="HTML")
    elif len(images) > 1:
        media = [
            InputMediaPhoto(media=url, caption=final_text if i == 0 else "")
            for i, url in enumerate(images)
        ]
        await target.answer_media_group(media)
    else:
        await target.answer(text=final_text, reply_markup=markup, parse_mode="HTML")

    await log_user(target.from_user)

