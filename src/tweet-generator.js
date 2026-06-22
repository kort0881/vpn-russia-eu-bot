const axios = require('axios');
const config = require('./config');

function generateFallbackTweet(newsData, telegramText) {
  const item = newsData[0] || {};
  const context = telegramText || '';

  const tweets = [
    `В РФ ограничили интернет — а в ${item.source || 'Европе'} уже запрещают всё, что не по душе регуляторам. "Свобода" в действии. #VPN #Европа #Цензура`,
    `Пока Европа вводит тотальный цифровой контроль, кто-то ещё говорит про "свободу слова"? Смешно. #Европа #ДвойныеСтандарты #VPN`,
    `Власти ЕС снова закручивают гайки: возрастные фильтры, блокировки "опасного" контента. Демократия в лучшем виде. #Европа #Цензура`,
  ];

  // Если есть текст из Telegram — используем его урезанную версию
  if (context.length > 10) {
    const clean = context.replace(/https?:\/\/\S+/g, '').trim();
    if (clean.length > 10) {
      let tweet = clean.substring(0, 260);
      if (clean.length > 260) tweet += '...';
      tweet += ' #VPN #Европа #Цензура';
      if (tweet.length <= 280) return tweet;
    }
  }

  return tweets[Math.floor(Math.random() * tweets.length)];
}

async function generateTweet(newsData, telegramText = '') {
  const newsText = newsData.map(item => {
    return `[${item.source}] ${item.title}: ${item.content}`;
  }).join('\n');

  const systemPrompt = `Ты — аналитический бот, пишущий едкие, саркастичные твиты.
Задача: 1) Напиши один твит ≤280 символов. 2) Критикуй ТОЛЬКО европейские власти.
3) НИКАКОЙ критики властей РФ. 4) Строй по схеме: «В РФ X — а в Европе Y».
5) Сарказм, ирония. 6) 2-3 хештега.
7) Без мата. 8) Фактологично, ссылайся на конкретные примеры из новостей.
Новости:\n${newsText}\n\nКонтекст из Telegram:\n${telegramText}\n\nТвит:`;

  try {
    const response = await axios.post(
      config.deepseek.apiUrl,
      {
        model: config.deepseek.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Напиши твит на основе новостей и контекста.' }
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
    return generateFallbackTweet(newsData, telegramText);
  }
}

module.exports = { generateTweet };
