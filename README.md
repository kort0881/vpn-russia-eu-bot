# VPN Russia EU Bot

Бот для ежедневных твитов о VPN, блокировках интернета и цифровой свободе.

## Как это работает

1. GitHub Actions запускает скрипт каждый день в 18:00 МСК
2. Скрипт собирает новости из RSS-лент указанных источников
3. DeepSeek API генерирует едкий твит (≤280 символов) с критикой европейских властей
4. Твит публикуется в Twitter/X

## Настройка

1. Форкнуть/клонировать репозиторий
2. Добавить в Settings → Secrets → Actions:
   - `TWITTER_API_KEY`
   - `TWITTER_API_SECRET`
   - `TWITTER_ACCESS_TOKEN`
   - `TWITTER_ACCESS_TOKEN_SECRET`
   - `DEEPSEEK_API_KEY`
3. Вручную запустить workflow через Actions → Post Daily Tweet → Run workflow

## Структура

```
├── .github/workflows/post-tweet.yml   # GitHub Actions workflow
├── src/
│   ├── index.js                       # Главный скрипт
│   ├── news-fetcher.js                # Сбор новостей из RSS
│   ├── tweet-generator.js             # Генерация твита через DeepSeek
│   ├── twitter-client.js              # Публикация в Twitter
│   └── config.js                      # Конфигурация
├── package.json
├── .gitignore
└── README.md
```
