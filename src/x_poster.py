import os
import json
import logging
import asyncio

from playwright.async_api import async_playwright

log = logging.getLogger(__name__)

X_URL = "https://x.com"


async def post_tweet(text: str) -> bool:
    """Публикация твита через Playwright (браузерная автоматизация, бесплатно)."""
    if len(text) > 280:
        text = text[:277] + "..."

    username = os.environ.get("X_USERNAME", "")
    password = os.environ.get("X_PASSWORD", "")
    cookies_str = os.environ.get("X_COOKIES", "")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/125.0.0.0 Safari/537.36"
            )
        )

        # Если есть cookies — загружаем
        if cookies_str:
            try:
                cookies = json.loads(cookies_str)
                # Конвертируем простой dict в формат Playwright
                pw_cookies = [
                    {
                        "name": k,
                        "value": v,
                        "domain": ".x.com",
                        "path": "/",
                    }
                    for k, v in cookies.items()
                ]
                await context.add_cookies(pw_cookies)
                log.info("✅ Cookies загружены")
            except Exception as e:
                log.warning(f"⚠️ Ошибка загрузки cookies: {e}")

        page = await context.new_page()

        # Проверяем, залогинены ли
        await page.goto(f"{X_URL}/home", wait_until="domcontentloaded", timeout=30000)
        await page.wait_for_timeout(3000)

        # Если нет — логинимся
        login_url = page.url
        if "login" in login_url or "i/flow" in login_url:
            log.info("🔑 Нужен логин...")
            if not username or not password:
                log.warning("⚠️ Нет логина/пароля для X")
                await browser.close()
                return False

            # Вводим username
            await page.goto(f"{X_URL}/i/flow/login", wait_until="domcontentloaded")
            await page.wait_for_timeout(2000)

            username_input = page.locator('input[autocomplete="username"]')
            await username_input.fill(username)
            await page.locator('button:has-text("Next")').click()
            await page.wait_for_timeout(2000)

            # Если спросит email/телефон
            email_input = page.locator('input[data-testid="ocfEnterTextTextInput"]')
            if await email_input.is_visible():
                email = os.environ.get("X_EMAIL", username)
                await email_input.fill(email)
                await page.locator('button:has-text("Next")').click()
                await page.wait_for_timeout(2000)

            # Пароль
            password_input = page.locator('input[autocomplete="current-password"]')
            if await password_input.is_visible():
                await password_input.fill(password)
                await page.locator('button:has-text("Log in")').click()
                await page.wait_for_timeout(5000)
                log.info("✅ Залогинились")

        # Публикуем твит
        log.info("🐦 Публикация твита...")
        await page.goto(f"{X_URL}/compose/tweet", wait_until="domcontentloaded", timeout=15000)
        await page.wait_for_timeout(2000)

        textarea = page.locator('[data-testid="tweetTextarea_0"]')
        await textarea.click()
        await textarea.fill(text)

        post_button = page.locator('[data-testid="tweetButton"]')
        await post_button.click()
        await page.wait_for_timeout(3000)

        log.info(f"✅ Твит опубликован: {text}")
        await browser.close()
        return True
