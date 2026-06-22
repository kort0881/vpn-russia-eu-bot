const { fetchTelegramPosts, getLastProcessedId } = require('./telegram-fetcher');
const { generateTweet } = require('./tweet-generator');
const { postTweet } = require('./x-poster');

async function main() {
  console.log('🚀 Запуск бота (Telegram → X)...');

  // 1. Получаем посты из Telegram
  console.log('📡 Получение постов из Telegram...');
  const posts = await fetchTelegramPosts(5);
  console.log(`📰 ${posts.length} постов из Telegram`);

  if (posts.length > 0) {
    const lastPost = posts[posts.length - 1];
    console.log('📝 Последний пост:', lastPost.text.substring(0, 100));

    // Генерируем твит (через DeepSeek + пост из Telegram)
    console.log('🤖 Генерация твита...');
    const tweetText = await generateTweet([], lastPost.text);
    console.log('📝 Твит:', tweetText);

    // 4. Публикуем
    console.log('🐦 Публикация в X...');
    await postTweet(tweetText);
  } else {
    console.log('⚠️ Нет новых постов в Telegram');
  }

  console.log('✅ Готово');
}

main().catch(e => {
  console.error('❌ Ошибка:', e.message);
  process.exit(1);
});
