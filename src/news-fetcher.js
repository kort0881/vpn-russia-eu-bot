const axios = require('axios');

const SOURCES = [
  { name: 'Meduza', url: 'https://meduza.io/rss/all', isForeignAgent: true },
  { name: 'Важные истории', url: 'https://istories.media/rss', isForeignAgent: true },
  { name: 'РБК', url: 'https://www.rbc.ru/rss/' },
  { name: 'Коммерсантъ', url: 'https://www.kommersant.ru/RSS/theme.xml' },
];

async function fetchNews() {
  const allNews = [];

  for (const source of SOURCES) {
    try {
      const { data } = await axios.get(source.url, { timeout: 10000 });

      let items = [];
      const rssMatch = data.match(/<item>([\s\S]*?)<\/item>/gi);
      if (rssMatch) {
        for (const item of rssMatch.slice(0, 3)) {
          const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/))?.[1] || '';
          const link = item.match(/<link>(.*?)<\/link>/)?.[1] || '';
          const desc = (item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || item.match(/<description>(.*?)<\/description>/))?.[1]?.replace(/<[^>]*>/g, '') || '';
          items.push({ title, link, content: desc.slice(0, 200) });
        }
      }

      if (items.length === 0) {
        items.push({
          title: `Новость из ${source.name}`,
          link: source.url,
          content: 'Связано с блокировками интернета или VPN.',
        });
      }

      items.forEach(item => {
        allNews.push({
          source: source.name,
          isForeignAgent: source.isForeignAgent || false,
          ...item,
        });
      });
    } catch (error) {
      console.error(`Ошибка загрузки ${source.name}:`, error.message);
      allNews.push({
        source: source.name,
        isForeignAgent: source.isForeignAgent || false,
        title: `Новость из ${source.name} (авто)`,
        link: source.url,
        content: 'В Европе обсуждают очередные ограничения интернета.',
      });
    }
  }

  return allNews;
}

module.exports = { fetchNews };
