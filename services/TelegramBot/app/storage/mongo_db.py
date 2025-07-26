from motor.motor_asyncio import AsyncIOMotorClient
import logging

logger = logging.getLogger(__name__)

# Подключение к MongoDB
client = AsyncIOMotorClient("mongodb://mongodb:27017/")
db = client["tbpv6"]
handlers_collection = db["handlers"]
bot_config_collection = db["bot_config"]
messages_collection = db["messages"] # Новая коллекция для содержимого сообщений
keyboards_collection = db["keyboards"] # Новая коллекция для клавиатур
user_states_collection = db["user_states"] # Используем существующую коллекцию для получения user_id

async def upsert_data(data):
    name = data.get("name")
    if not name:
        raise ValueError("В документе должен быть ключ 'name'")

    result = await handlers_collection.update_one(
        {"name": name},
        {"$set": data},
        upsert=True
    )
    logger.info(f"Данные обновлены/вставлены в handlers_collection для name: {name}")
    return result


async def add_images_to_message(message_name: str, image_urls: list[str]):
    collection = await read_data("message")
    result = await collection.update_one(
        {"name": message_name},
        {"$set": {"images": image_urls}}
    )
    logger.info(f"Изображения добавлены/обновлены для сообщения: {message_name}")
    return result


async def read_data(collection_name):
    return db[collection_name]


async def get_bot_config():
    try:
        config_doc = await bot_config_collection.find_one({})
        if config_doc:
            logger.info("Конфигурация бота успешно загружена из MongoDB.")
            return config_doc
        else:
            logger.warning("Конфигурация бота не найдена в коллекции 'bot_config'.")
            return None
    except Exception as e:
        logger.error(f"Ошибка при загрузке конфигурации бота из MongoDB: {e}")
        return None

async def initialize_bot_config_if_not_exists():
    existing_config = await bot_config_collection.find_one({})
    if not existing_config:
        default_config = {
            "admin_ids": [],
            "log_level": "INFO",
            "webhook_url": None,
            "webhook_port": None
        }
        await bot_config_collection.insert_one(default_config)
        logger.info("Дефолтная конфигурация бота вставлена в 'bot_config'.")
        logger.warning("Внимание: 'bot_token' не был автоматически добавлен. Пожалуйста, добавьте его вручную в коллекцию 'bot_config' в MongoDB.")
    else:
        logger.info("Конфигурация бота уже существует в 'bot_config'.")


async def get_message_content(message_name: str):
    """
    Получает содержимое сообщения по его имени из коллекции 'messages'.
    """
    return await messages_collection.find_one({"name": message_name})

async def get_all_user_ids():
    """
    Получает все уникальные user_id из коллекции 'user_states'.
    """
    # Используем distinct для получения уникальных user_id
    # Обратите внимание: motor.motor_asyncio.AsyncIOMotorCollection.distinct
    # возвращает список, который уже содержит уникальные значения.
    try:
        user_ids = await user_states_collection.distinct("user_id")
        logger.info(f"Получено {len(user_ids)} уникальных user_id.")
        return user_ids
    except Exception as e:
        logger.error(f"Ошибка при получении всех user_id из 'user_states': {e}")
        return []

