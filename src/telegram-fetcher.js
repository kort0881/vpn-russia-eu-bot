const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Получить последние сообщения из Telegram-канала
 * @param {number} limit - сколько последних сообщений
 * @returns {Array} массив сообщений
 */
async function fetchTelegramPosts(limit = 5) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log('⚠️ TELEGRAM_BOT_TOKEN не задан, возвращаю заглушку');
    return [
      {
        message_id: 1,
        text: 'Тестовое сообщение из Telegram о блокировках в Европе',
        date: new Date().toISOString(),
      },
    ];
  }

  try {
    const { data } = await axios.get(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`,
      {
        params: { timeout: 30, offset: -limit, allowed_updates: ['message'] },
        timeout: 15000,
      }
    );

    if (!data.ok) {
      throw new Error(`Telegram API error: ${data.description || 'unknown'}`);
    }

    const posts = [];
    const seen = new Set();

    for (const update of (data.result || [])) {
      const msg = update.message || update.channel_post;
      if (!msg) continue;

      const text = msg.text || msg.caption || '';
      if (!text.trim()) continue;

      const messageId = msg.message_id;
      if (seen.has(messageId)) continue;
      seen.add(messageId);

      posts.push({
        message_id: messageId,
        text: text,
        date: new Date(msg.date * 1000).toISOString(),
        has_media: !!(msg.photo || msg.video || msg.document),
        media_group_id: msg.media_group_id,
      });
    }

    // Возвращаем последние N неповторяющихся
    return posts.slice(-limit);
  } catch (error) {
    console.error('❌ Ошибка получения постов из Telegram:', error.message);
    return [];
  }
}

/**
 * Получить ID последнего обработанного поста (из переменной)
 */
function getLastProcessedId() {
  return process.env.LAST_PROCESSED_ID ? parseInt(process.env.LAST_PROCESSED_ID) : 0;
}

module.exports = { fetchTelegramPosts, getLastProcessedId };
