const axios = require('axios');
const config = require('./config');

function generateFallbackTweet(newsData) {
  // Берём первую новость для контекста
  const item = newsData[0] || {};
  const topics = ['VPN', 'Европа', 'Цензура', 'ДвойныеСтандарты'];
  const tweets = [
    `В РФ ограничили интернет — а в ${item.source || 'Европе'} уже запрещают всё, что не по душе регуляторам. "Свобода" в действии. #VPN #Европа #Цензура`,
    `Пока Европа вводит тотальный цифровой контроль, кто-то ещё говорит про "свободу слова"? Смешно. #Европа #ДвойныеСтандарты #VPN`,
    `Власти ЕС снова закручивают гайки: возрастные фильтры, блокировки "опасного" контента. Демократия в лучшем виде. #Европа #Цензура`,
  ];
  return tweets[Math.floor(Math.random() * tweets.length)];
}

async function generateTweet(newsData) {
  // Пробуем DeepSeek, при ошибке — fallback
  const newsText = newsData.map(item => {
    let sourceInfo = item.source;
    if (item.isForeignAgent) sourceInfo += ' (иноагент)';
    return `[${sourceInfo}] ${item.title}`;
  }).join('\n');

  try {
    const response = await axios.post(
      config.deepseek.apiUrl,
      {
        model: config.deepseek.model,
        messages: [
          { role: 'system', content: `Ты пишешь едкие саркастичные твиты (≤280 символов). Критикуй ТОЛЬКО европейские власти. НЕ критикуй власти РФ. Строй по схеме: "В РФ X — а в Европе Y". Укажи источник-иноагента если есть. 2-3 хештега.` },
          { role: 'user', content: `Новости:\n${newsText}\n\nНапиши твит:` }
        ],
        temperature: 0.9,
        max_tokens: 300
      },
      {
        headers: {
          'Authorization': `Bearer ${config.deepseek.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    let tweetText = response.data.choices[0].message.content.trim();
    if (tweetText.length > 280) tweetText = tweetText.substring(0, 277) + '...';
    return tweetText;
  } catch (error) {
    console.error('DeepSeek error, using fallback:', error.message);
    return generateFallbackTweet(newsData);
  }
}

module.exports = { generateTweet };
