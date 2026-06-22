import os
import logging

import httpx

logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger(__name__)


def fetch_telegram_posts(bot_token: str, chat_id: str, limit: int = 5) -> list[dict]:
    """
    Получает последние сообщения из Telegram-канала через Bot API.
    Не использует long polling — простой GET /getUpdates.
    """
    if not bot_token:
        log.warning("⚠️ TELEGRAM_BOT_TOKEN не задан, тестовая заглушка")
        return [{"message_id": 1, "text": "Тестовое сообщение из ТГ", "date": ""}]

    url = f"https://api.telegram.org/bot{bot_token}/getUpdates"
    params = {"timeout": 10, "allowed_updates": ["message", "channel_post"]}

    try:
        resp = httpx.get(url, params=params, timeout=15)
        data = resp.json()
        if not data.get("ok"):
            log.error(f"❌ Telegram API error: {data.get('description', 'unknown')}")
            return []

        posts = []
        seen = set()

        for update in data.get("result", []):
            msg = update.get("message") or update.get("channel_post")
            if not msg:
                continue

            text = msg.get("text") or msg.get("caption") or ""
            if not text.strip():
                continue

            mid = msg["message_id"]
            if mid in seen:
                continue
            seen.add(mid)

            posts.append({
                "message_id": mid,
                "text": text,
                "date": msg.get("date", ""),
            })

        return posts[-limit:]

    except Exception as e:
        log.error(f"❌ Ошибка Telegram: {e}")
        return []
