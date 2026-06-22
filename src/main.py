import os
import asyncio
import logging

from telegram_fetcher import fetch_telegram_posts
from tweet_generator import generate_tweet
from x_poster import post_tweet

logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger(__name__)


async def main():
    log.info("🚀 Запуск бота (Telegram → X)")

    # 1. Посты из Telegram
    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID", "")
    posts = fetch_telegram_posts(bot_token, chat_id, limit=5)
    log.info(f"📰 {len(posts)} постов из Telegram")

    if not posts:
        log.warning("⚠️ Нет постов, выход")
        return

    last_text = posts[-1]["text"]
    log.info(f"📝 Последний пост: {last_text[:100]}")

    # 2. Генерация твита
    api_key = os.environ.get("DEEPSEEK_API_KEY", "")
    tweet = await generate_tweet(last_text, api_key)
    log.info(f"📝 Твит: {tweet}")

    # 3. Публикация
    ok = await post_tweet(tweet)
    if ok:
        log.info("✅ Готово — твит опубликован")
    else:
        log.warning("⚠️ Твит не опубликован")


if __name__ == "__main__":
    asyncio.run(main())
