const { fetchNews } = require('./news-fetcher');
const { generateTweet } = require('./tweet-generator');
const { postTweet } = require('./twitter-client');

async function main() {
  try {
    console.log('🚀 Запуск бота...');
    console.log('📡 Сбор новостей...');

    const news = await fetchNews();
    console.log(`📰 Найдено ${news.length} новостей`);

    console.log('🤖 Генерация твита через DeepSeek...');
    const tweetText = await generateTweet(news);
    console.log('📝 Сгенерированный твит:', tweetText);

    console.log('🐦 Публикация...');
    await postTweet(tweetText);

    console.log('✅ Готово!');
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

main();
