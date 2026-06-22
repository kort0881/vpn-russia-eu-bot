import os
import logging

import httpx

log = logging.getLogger(__name__)

DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions"

FALLBACK_TWEETS = [
    'В РФ ограничили интернет — а в Европе уже запрещают всё, что не по душе регуляторам. "Свобода" в действии. #VPN #Европа #Цензура',
    "Пока Европа вводит тотальный цифровой контроль, кто-то ещё говорит про \"свободу слова\"? Смешно. #Европа #ДвойныеСтандарты #VPN",
    "Власти ЕС снова закручивают гайки: возрастные фильтры, блокировки \"опасного\" контента. Демократия в лучшем виде. #Европа #Цензура",
]


def _fallback(telegram_text: str = "") -> str:
    if len(telegram_text) > 15:
        clean = telegram_text.split("http")[0].strip()
        if clean:
            tweet = clean[:255]
            if len(clean) > 255:
                tweet += "..."
            tweet += " #VPN #Европа"
            if len(tweet) <= 280:
                return tweet
    import random
    return random.choice(FALLBACK_TWEETS)


async def generate_tweet(telegram_text: str, api_key: str) -> str:
    if not api_key:
        log.warning("⚠️ Нет DEEPSEEK_API_KEY, fallback")
        return _fallback(telegram_text)

    prompt = f"""Ты — аналитический бот, пишущий едкие, саркастичные твиты.

Задача:
1. Напиши один твит ≤280 символов.
2. Критикуй ТОЛЬКО европейские власти (Германию, Францию, ЕС).
3. НИКАКОЙ критики властей РФ.
4. Строй по схеме: «В РФ X — а в Европе Y».
5. Сарказм, ирония. 6) 2-3 хештега.
7. Без мата. 8) Фактологично.

Контекст из Telegram:
{telegram_text}

Твит:"""

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                DEEPSEEK_URL,
                json={
                    "model": "deepseek-chat",
                    "messages": [
                        {"role": "system", "content": prompt},
                        {"role": "user", "content": "Напиши твит."},
                    ],
                    "temperature": 0.9,
                    "max_tokens": 300,
                },
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
            )
            data = resp.json()
            tweet = data["choices"][0]["message"]["content"].strip()
            if len(tweet) > 280:
                tweet = tweet[:277] + "..."
            return tweet
    except Exception as e:
        log.error(f"❌ DeepSeek error: {e}")
        return _fallback(telegram_text)
