import logging
import re
import os
from urllib.parse import urlparse
from aiogram import Bot, types
from aiogram.types import Message, InputMediaPhoto, InlineKeyboardMarkup, InlineKeyboardButton, ReplyKeyboardMarkup, KeyboardButton, BufferedInputFile
from app.storage.mongo_db import read_data, messages_collection
from .keyboard_builder import get_keyboard_by_name, build_inline_keyboard
from .variables import get_all_variables
from .statistics import log_user, log_interaction_event


logger = logging.getLogger(__name__)

LOCAL_IMAGE_MOUNT_PATH = "/bot_uploads"
LOCAL_BACKEND_UPLOADS_BASE_URL = "http://admin_backend:3000/uploads/"


class SafeDict(dict):
    def __missing__(self, key):
        return "{" + key + "}"

async def get_message_by_name(name: str) -> dict | None:
    collection = await read_data("message")
    return await collection.find_one({"name": name})

async def format_text_with_calculation(
    text: str,
    user_id: int,
    user_inputs_collection,
    extra_vars: dict = None
) -> str:
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


async def send_message_to_user_by_name(
    message_name: str,
    bot: Bot,
    chat_id: int,
    user_id_for_logging: int,
    context: dict = None
):
    message_data = await get_message_by_name(message_name)
    if not message_data:
        logger.warning(f"Сообщение с именем '{message_name}' не найдено в базе данных.")
        return

    images_from_db = message_data.get("images", [])
    raw_text = message_data.get("text", "")
    context = context or {}

    db_vars = await get_all_variables()
    all_vars = {**db_vars, **context}
    all_vars = {str(k): v for k, v in all_vars.items()}

    user_inputs_collection = await read_data("user_inputs")
    final_text = await format_text_with_calculation(raw_text, user_id_for_logging, user_inputs_collection, extra_vars=all_vars)

    media_to_send = []
    for img_url in images_from_db:
        logger.info(f"Получен URL изображения из БД: {img_url}")
        logger.info(f"LOCAL_BACKEND_UPLOADS_BASE_URL: {LOCAL_BACKEND_UPLOADS_BASE_URL}")

        if img_url.startswith(LOCAL_BACKEND_UPLOADS_BASE_URL):
            logger.info(f"URL '{img_url}' распознан как локальный (начинается с {LOCAL_BACKEND_UPLOADS_BASE_URL}).")
            try:
                file_name = os.path.basename(urlparse(img_url).path)
                
                local_file_path = os.path.join(LOCAL_IMAGE_MOUNT_PATH, file_name)

                logger.info(f"Имя файла из URL: {file_name}")
                logger.info(f"Предполагаемый локальный путь: {local_file_path}")

                if not os.path.exists(local_file_path):
                    logger.error(f"Файл изображения НЕ НАЙДЕН по локальному пути: {local_file_path} (из URL: {img_url}). Проверьте монтирование папки и наличие файла.")
                    continue

                with open(local_file_path, "rb") as f:
                    media_to_send.append(InputMediaPhoto(media=BufferedInputFile(f.read(), filename=file_name)))
                logger.info(f"Файл '{local_file_path}' успешно прочитан и добавлен для отправки.")
            except Exception as e:
                logger.error(f"Ошибка при обработке локального изображения '{img_url}': {e}", exc_info=True)
                continue
        else:
            if img_url.startswith("http://") or img_url.startswith("https://"):
                logger.info(f"URL '{img_url}' распознан как внешняя ссылка. Отправляем как есть.")
                media_to_send.append(InputMediaPhoto(media=img_url))
            else:
                logger.warning(f"Некорректный или неопознанный URL изображения, пропущен: {img_url}")
                continue


    markup = None
    if len(media_to_send) <= 1:
        keyboard_data = await get_keyboard_by_name(message_data.get("keyboard_name"))
        markup = await build_inline_keyboard(keyboard_data) if keyboard_data else None

    if not media_to_send and not final_text:
        logger.warning(f"Отправка сообщения '{message_name}' пользователю {chat_id}: нет ни медиа, ни текста. Сообщение не будет отправлено.")
    elif not media_to_send and final_text:
        logger.info(f"Отправка только текстового сообщения для '{message_name}' пользователю {chat_id}.")
    else:
        logger.info(f"Подготовлено {len(media_to_send)} медиа-элемент(ов) для отправки для '{message_name}' пользователю {chat_id}.")


    try:
        if len(media_to_send) == 1:
            await bot.send_photo(chat_id=chat_id, photo=media_to_send[0].media, caption=final_text, reply_markup=markup, parse_mode="HTML")
            logger.info(f"Сообщение '{message_name}' (одно фото) успешно отправлено пользователю {chat_id}.")
        elif len(media_to_send) > 1:
            await bot.send_media_group(chat_id=chat_id, media=media_to_send)
            logger.info(f"Сообщение '{message_name}' (группа фото) успешно отправлено пользователю {chat_id}.")
            if markup:
                await bot.send_message(chat_id=chat_id, text=".", reply_markup=markup, parse_mode="HTML")
                logger.info(f"Клавиатура для '{message_name}' отправлена отдельным сообщением пользователю {chat_id}.")
        else:
            if final_text:
                await bot.send_message(chat_id=chat_id, text=final_text, reply_markup=markup, parse_mode="HTML")
                logger.info(f"Сообщение '{message_name}' (только текст) успешно отправлено пользователю {chat_id}.")
            else:
                logger.warning(f"Нечего отправлять для сообщения '{message_name}' пользователю {chat_id}: нет текста и нет медиа.")


    except Exception as e:
        logger.error(f"Критическая ошибка при отправке сообщения '{message_name}' пользователю {chat_id}: {e}", exc_info=True)


async def send_message_by_name(
    message_name: str,
    target: Message | types.Message,
    context: dict = None
):
    await send_message_to_user_by_name(
        message_name=message_name,
        bot=target.bot,
        chat_id=target.chat.id,
        user_id_for_logging=target.from_user.id,
        context=context
    )
    await log_user(target.from_user)