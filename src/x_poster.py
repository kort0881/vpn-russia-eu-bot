import os
import json
import logging

from twikit import Client

log = logging.getLogger(__name__)

COOKIES_FILE = "x_cookies.json"


async def _get_client() -> Client | None:
    client = Client("en-US")

    # Пробуем cookies
    if os.path.exists(COOKIES_FILE):
        try:
            client.load_cookies(COOKIES_FILE)
            log.info("✅ X — авторизация по cookies")
            return client
        except Exception:
            log.warning("⚠️ cookies не подошли, пробуем логин")

    # Логин по паролю
    username = os.environ.get("X_USERNAME")
    password = os.environ.get("X_PASSWORD")
    email = os.environ.get("X_EMAIL")

    if username and password:
        try:
            await client.login(auth_info_1=username, auth_info_2=email, password=password)
            client.save_cookies(COOKIES_FILE)
            log.info("✅ X — авторизация по паролю")
            return client
        except Exception as e:
            log.error(f"❌ X логин не удался: {e}")
            return None

    log.warning("⚠️ Нет X_USERNAME/X_PASSWORD")
    return None


async def post_tweet(text: str) -> bool:
    if len(text) > 280:
        text = text[:277] + "..."

    client = await _get_client()
    if not client:
        log.warning("⚠️ X не авторизован, твит не опубликован")
        return False

    try:
        result = await client.create_tweet(text)
        log.info(f"✅ Твит опубликован: {text}")
        if hasattr(result, "id"):
            log.info(f"🔗 https://x.com/i/web/status/{result.id}")
        elif isinstance(result, dict) and result.get("id"):
            log.info(f"🔗 https://x.com/i/web/status/{result['id']}")
        return True
    except Exception as e:
        log.error(f"❌ Ошибка публикации: {e}")
        return False
