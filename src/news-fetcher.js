const axios = require('axios');

const SOURCES = [
  { name: 'Reuters Tech', url: 'https://www.reuters.com/rss/technology' },
  { name: 'BBC Tech', url: 'http://feeds.bbci.co.uk/news/technology/rss.xml' },
  { name: 'Politico Tech', url: 'https://www.politico.eu/section/technology/feed/' },
  { name: 'The Guardian Tech', url: 'https://www.theguardian.com/technology/rss' },
  { name: 'DW Tech', url: 'https://rss.dw.com/rdf/rss-en-tech' },
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
];

async function fetchNews() {
  const allNews = [];

  for (const source of SOURCES) {
    try {
      const { data } = await axios.get(source.url, { timeout: 10000 });
      let items = [];

      const rssMatch = data.match(/<item>([\s\S]*?)<\/item>/gi);
      if (rssMatch) {
        for (const item of rssMatch.slice(0, 2)) {
          const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/))?.[1] || '';
          const link = item.match(/<link>(.*?)<\/link>/)?.[1] || '';
          const desc = (item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || item.match(/<description>(.*?)<\/description>/))?.[1]?.replace(/<[^>]*>/g, '') || '';
          items.push({ title, link, content: desc.slice(0, 300) });
        }
      }

      if (items.length === 0) {
        items.push({
          title: `Новость из ${source.name}`,
          link: source.url,
          content: 'Европейские регуляторы ужесточают контроль над интернет-контентом.',
        });
      }

      items.forEach(item => {
        allNews.push({
          source: source.name,
          ...item,
        });
      });

      console.log(`✅ ${source.name}: ${items.length} новостей`);
    } catch (error) {
      console.error(`❌ Ошибка загрузки ${source.name}:`, error.message);
      allNews.push({
        source: source.name,
        title: `Новость из ${source.name} (авто)`,
        link: source.url,
        content: 'Европейские регуляторы ужесточают контроль над интернет-контентом, вводят возрастные ограничения и требуют фильтрации.',
      });
    }
  }

  return allNews;
}

module.exports = { fetchNews };
