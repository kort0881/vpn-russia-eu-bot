# VPN Russia EU Bot — Telegram → Twitter (X)

Бот: читает посты из Telegram-канала @vlesstrojan, генерирует твит через DeepSeek, публикует в X без платного API.

## Как работает

1. GitHub Actions запускает скрипт ежедневно в 18:00 МСК
2. `telegram_fetcher.py` — получает последний пост из Telegram
3. `tweet_generator.py` — DeepSeek генерирует едкий твит (критика властей ЕС)
4. `x_poster.py` — публикует через twikit (бесплатно, без X API)

## Секреты GitHub

| Secret | Описание |
|--------|----------|
| `TELEGRAM_BOT_TOKEN` | Токен бота от @BotFather |
| `TELEGRAM_CHAT_ID` | @vlesstrojan |
| `X_USERNAME` | kort0881 |
| `X_PASSWORD` | пароль от X |
| `X_EMAIL` | doktorwatsone@gmail.com |
| `DEEPSEEK_API_KEY` | Ключ DeepSeek |
