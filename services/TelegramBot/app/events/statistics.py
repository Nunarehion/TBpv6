from datetime import datetime
from app.storage.mongo_db import read_data

async def log_user(user):
    users = await read_data("users")
    existing = await users.find_one({"user_id": user.id})

    user_data = {
        "user_id": user.id,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "full_name": user.full_name,
        "language": user.language_code,
        "mention": user.mention_html(),
        "last_active": datetime.utcnow(),
    }

    if not existing:
        user_data["created_at"] = datetime.utcnow()
        await users.insert_one(user_data)
    else:
        await users.update_one(
            {"user_id": user.id},
            {"$set": {
                "last_active": datetime.utcnow(),
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "language": user.language_code,
            }}
        )

    
        
async def log_interaction_event(user_id: int, chat_id: int, pattern: str, latency_ms: float, timestamp):
    collection = await read_data("interactions")
    await collection.insert_one({
        "user_id": user_id,
        "chat_id": chat_id,
        "pattern": pattern,
        "latency_ms": latency_ms,
        "timestamp": timestamp
    })
