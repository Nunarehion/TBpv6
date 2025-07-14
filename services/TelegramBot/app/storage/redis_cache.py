import redis
import json
from functools import wraps

def get_redis_connection():
    return redis.Redis(host='redis', port=6379, decode_responses=True)

def listen_to_redis_updates(channel):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            r = get_redis_connection()
            pubsub = r.pubsub()
            pubsub.subscribe(channel)

            while True:
                message = pubsub.get_message()
                if message and message['type'] == 'message':
                    data = json.loads(message['data'])
                    func(data, *args, **kwargs)
                # Задержка для предотвращения излишней загрузки CPU
                time.sleep(1)
        return wrapper
    return decorator

# @listen_to_redis_updates('admin_updates')
# def handle_message(data):
#     print("Received update:", data)

def wMessage(key, message):
    r = get_redis_connection()
    message_json = json.dumps(message)
    r.set(key, message_json)

def rMessage(key):
    r = get_redis_connection()
    loaded_message_json = r.get(key)
    if loaded_message_json:
        return json.loads(loaded_message_json)
    return None

if __name__ == '__main__':
    # Пример использования
    test_message = {
        "message": "Привет! Это тестовое сообщение."
    }

    wMessage('test_message', test_message)
    loaded_message = rMessage('test_message')
    print(loaded_message)

    # Запуск прослушивания обновлений
    handle_message({})  # Это не нужно, просто запускаем слушатель
