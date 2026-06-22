const { TwitterApi } = require('twitter-api-v2');
const config = require('./config');

async function postTweet(text) {
  const client = new TwitterApi({
    appKey: config.twitter.apiKey,
    appSecret: config.twitter.apiSecret,
    accessToken: config.twitter.accessToken,
    accessSecret: config.twitter.accessTokenSecret,
  });

  try {
    const tweet = await client.v2.tweet(text);
    console.log('✅ Твит опубликован:', text);
    console.log('🔗 Ссылка:', `https://twitter.com/i/web/status/${tweet.data.id}`);
    return tweet;
  } catch (error) {
    console.error('❌ Ошибка публикации твита:', error);
    throw error;
  }
}

module.exports = { postTweet };
