import redis
import json
import asyncio
import threading
import logging

logger = logging.getLogger(__name__)

def get_redis_connection():
    """
    Возвращает подключение к Redis.
    Предполагается, что Redis доступен по имени хоста 'redis' (для Docker Compose)
    или 'localhost' в других случаях.
    """
    try:
        r = redis.Redis(host='redis', port=6379, decode_responses=True, socket_connect_timeout=1)
        r.ping()
        logger.debug("Успешное подключение к Redis.")
        return r
    except redis.exceptions.ConnectionError as e:
        logger.error(f"Не удалось подключиться к Redis: {e}")
        try:
            r = redis.Redis(host='localhost', port=6379, decode_responses=True, socket_connect_timeout=1)
            r.ping()
            logger.debug("Успешное подключение к Redis через localhost.")
            return r
        except redis.exceptions.ConnectionError as e_local:
            logger.error(f"Не удалось подключиться к Redis через localhost: {e_local}")
            raise
def wMessage(key, message):
    """
    Записывает JSON-сообщение в Redis по указанному ключу.
    """
    r = get_redis_connection()
    message_json = json.dumps(message)
    r.set(key, message_json)
    logger.debug(f"Сообщение записано в Redis по ключу '{key}'")

def rMessage(key):
    """
    Читает JSON-сообщение из Redis по указанному ключу.
    """
    r = get_redis_connection()
    loaded_message_json = r.get(key)
    if loaded_message_json:
        logger.debug(f"Сообщение прочитано из Redis по ключу '{key}'")
        return json.loads(loaded_message_json)
    logger.debug(f"Сообщение не найдено для ключа Redis '{key}'")
    return None

async def start_redis_listener(channel: str, handler_func, loop: asyncio.AbstractEventLoop):
    """
    Запускает асинхронный Pub/Sub слушатель Redis в отдельном потоке,
    чтобы избежать блокировки основного цикла событий.
    handler_func - это асинхронная функция, которая будет вызвана
    с данными из Redis сообщения.
    """
    def _listener_thread_target():
        try:
            r = get_redis_connection()
            pubsub = r.pubsub()
            pubsub.subscribe(channel)
            logger.info(f"Redis Pub/Sub слушатель запущен на канале '{channel}' в отдельном потоке.")

            for message in pubsub.listen():
                if message and message['type'] == 'message':
                    try:
                        data = json.loads(message['data'])
                        logger.info(f"Получено сообщение из Redis канала '{channel}': {data}")
                        asyncio.run_coroutine_threadsafe(handler_func(data), loop)
                    except json.JSONDecodeError as e:
                        logger.error(f"Не удалось декодировать JSON из Redis сообщения: {e} - Данные: {message['data']}")
                    except Exception as e:
                        logger.error(f"Ошибка при обработке Redis сообщения: {e}")
        except Exception as e:
            logger.critical(f"Критическая ошибка в потоке Redis слушателя: {e}. Поток будет остановлен.")

    thread = threading.Thread(target=_listener_thread_target, daemon=True)
    thread.start()
    logger.info("Поток слушателя Redis инициирован.")

