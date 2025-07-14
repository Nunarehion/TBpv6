from motor.motor_asyncio import AsyncIOMotorClient

# Подключение к MongoDB
client = AsyncIOMotorClient("mongodb://mongodb:27017/")
db = client["tbpv6"]
handlers_collection = db["handlers"]


async def upsert_data(data):
    """
    Обновляет документ по 'name', если он уже есть.
    Если нет — создаёт новый.
    """
    name = data.get("name")
    if not name:
        raise ValueError("В документе должен быть ключ 'name'")

    result = await handlers_collection.update_one(
        {"name": name},   
        {"$set": data}, 
        upsert=True  
    )
    return result


async def add_images_to_message(message_name: str, image_urls: list[str]):
    collection = await read_data("message")
    await collection.update_one(
        {"name": message_name},
        {"$set": {"images": image_urls}}
    )

async def read_data(collection_name):
    return db[collection_name]

