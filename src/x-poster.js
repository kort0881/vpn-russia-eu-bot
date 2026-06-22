const { Scraper } = require('xactions/client');

let scraper = null;

/**
 * Авторизация в X через XActions
 * Использует cookies из переменных окружения (если есть)
 */
async function getScraper() {
  if (scraper) return scraper;

  scraper = new Scraper();

  // Если есть сохранённые cookies — используем их
  const cookiesStr = process.env.X_COOKIES;
  if (cookiesStr) {
    try {
      const cookies = JSON.parse(cookiesStr);
      await scraper.setCookies(cookies);
      console.log('✅ Авторизация X через cookies');
      return scraper;
    } catch (e) {
      console.log('⚠️ Ошибка загрузки cookies, пробуем логин через пароль...');
    }
  }

  // Иначе логин через credentials
  const username = process.env.X_USERNAME;
  const password = process.env.X_PASSWORD;
  const email = process.env.X_EMAIL;

  if (username && password) {
    try {
      await scraper.login(username, password, email);
      console.log('✅ Авторизация X через логин/пароль');

      // Сохраняем cookies для следующих запусков
      const cookies = await scraper.getCookies();
      console.log('🍪 Cookies получены, можно сохранить как X_COOKIES secret');
      return scraper;
    } catch (e) {
      console.error('❌ Ошибка логина в X:', e.message);
      throw e;
    }
  }

  console.log('⚠️ Нет credentials X — твиты не будут опубликованы');
  return scraper;
}

/**
 * Опубликовать твит через XActions
 * @param {string} text - текст твита
 * @returns {Object|null} результат
 */
async function postTweet(text) {
  if (text.length > 280) {
    text = text.substring(0, 277) + '...';
  }

  try {
    const client = await getScraper();
    if (!client) {
      console.log('⚠️ X не авторизован, твит не опубликован:', text);
      return null;
    }

    const result = await client.sendTweet(text);
    console.log('✅ Твит опубликован через XActions:', text);
    if (result?.id) {
      console.log('🔗 https://x.com/i/web/status/' + result.id);
    }
    return result;
  } catch (error) {
    console.error('❌ Ошибка публикации твита (XActions):', error.message);
    return null;
  }
}

module.exports = { postTweet, getScraper };
