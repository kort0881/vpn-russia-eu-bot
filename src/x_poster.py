import os
import json
import logging

from twikit import Client

log = logging.getLogger(__name__)

COOKIES_FILE = "x_cookies.json"


async def _get_client() -> Client | None:
    client = Client("en-US")

    # Сначала пробуем cookies из переменной окружения
    cookies_str = os.environ.get("X_COOKIES")
    if cookies_str:
        try:
            cookies = json.loads(cookies_str)
            client.set_cookies_dict(cookies)
            log.info("✅ X — авторизация по cookies из X_COOKIES")
            return client
        except Exception as e:
            log.warning(f"⚠️ X_COOKIES не подошли: {e}")

    # Пробуем cookies из файла
    if os.path.exists(COOKIES_FILE):
        try:
            client.load_cookies(COOKIES_FILE)
            log.info("✅ X — авторизация по cookies файлу")
            return client
        except Exception as e:
            log.warning(f"⚠️ Cookies файл не подошёл: {e}")

    # Пробуем логин с новой сессией (новый метод)
    username = os.environ.get("X_USERNAME")
    password = os.environ.get("X_PASSWORD")
    email = os.environ.get("X_EMAIL")

    if username and password:
        try:
            # twikit v2.3.3 — новый формат login
            await client.login(
                auth_info_1=username,
                auth_info_2=email,
                password=password,
            )
            # Сохраняем cookies для следующих запусков
            cookies = client.get_cookies()
            if cookies:
                with open(COOKIES_FILE, "w") as f:
                    json.dump(dict(cookies), f)
                log.info("✅ Cookies сохранены")
            log.info("✅ X — авторизация по паролю")
            return client
        except Exception as e:
            log.error(f"❌ X логин не удался: {e}")
            return None

    log.warning("⚠️ Нет данных для авторизации X")
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
        tweet_id = None
        if isinstance(result, dict):
            tweet_id = result.get("id") or result.get("rest_id")
        else:
            tweet_id = getattr(result, "id", None) or getattr(result, "rest_id", None)
        if tweet_id:
            log.info(f"🔗 https://x.com/i/web/status/{tweet_id}")
        log.info(f"✅ Твит опубликован: {text}")
        return True
    except Exception as e:
        log.error(f"❌ Ошибка публикации: {e}")
        return False
