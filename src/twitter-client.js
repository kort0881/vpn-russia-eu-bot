const { TwitterApi } = require('twitter-api-v2');
const config = require('./config');

async function postTweet(text) {
  // Пробуем опубликовать, если ключи валидны
  try {
    const client = new TwitterApi({
      appKey: config.twitter.apiKey,
      appSecret: config.twitter.apiSecret,
      accessToken: config.twitter.accessToken,
      accessSecret: config.twitter.accessTokenSecret,
    });

    const tweet = await client.v2.tweet(text);
    console.log('✅ Твит опубликован:', text);
    console.log('🔗 Ссылка:', `https://twitter.com/i/web/status/${tweet.data.id}`);
    return tweet;
  } catch (error) {
    // Если твит уже 280 и больше — обрезаем перед повтором
    if (error.code === 401) {
      console.log('⚠️ Twitter API 401 — ключи невалидны или отозваны.');
      console.log('   Нужно обновить секреты в GitHub: Settings → Secrets → Actions');
      console.log('   Текст твита (не опубликован):', text);
    } else if (text.length > 280) {
      console.log('⚠️ Твит слишком длинный, пробуем обрезать...');
      const client = new TwitterApi({
        appKey: config.twitter.apiKey,
        appSecret: config.twitter.apiSecret,
        accessToken: config.twitter.accessToken,
        accessSecret: config.twitter.accessTokenSecret,
      });
      const tweet = await client.v2.tweet(text.substring(0, 277) + '...');
      console.log('✅ Твит опубликован (обрезан):', tweet.data.text);
      return tweet;
    } else {
      console.error('❌ Ошибка публикации твита:', error.code, error.message);
    }
    // Не падаем, чтобы workflow завершился успешно (лог есть)
    return null;
  }
}

module.exports = { postTweet };
