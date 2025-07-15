from app.storage.mongo_db import read_data


async def get_all_variables() -> dict:
    """
    Загружает все переменные из коллекции `variables` в MongoDB.
    Возвращает словарь {имя_переменной: значение}.
    """
    collection = await read_data("variables")
    cursor = collection.find({})
    vars_list = await cursor.to_list(length=None)
    variables = {str(item["name"]): item["value"] for item in vars_list}
    return variables
