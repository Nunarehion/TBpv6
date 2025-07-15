from aiogram import Router
from .message_handlers import router as message_router
from .callback_handlers import router as callback_router

router = Router()
router.include_router(message_router)
router.include_router(callback_router)
