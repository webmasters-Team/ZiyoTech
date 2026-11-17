import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MESSAGE_DEDUPE_TTL_MS = 15000;
const recentMessageIds = new Map();

function isDuplicateTelegramMessage(msg) {
  const key = `${msg.chat.id}:${msg.message_id}`;
  const now = Date.now();
  const lastSeen = recentMessageIds.get(key);

  if (lastSeen && now - lastSeen < MESSAGE_DEDUPE_TTL_MS) {
    return true;
  }

  recentMessageIds.set(key, now);
  return false;
}

export function createTelegramBot({ onMessage }) {
  if (!TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN not set. Telegram bot is disabled.');
    return null;
  }

  const bot = new TelegramBot(TOKEN, { polling: true });

  bot.onText(/.*/, async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text || '';

    if (!text.trim() || isDuplicateTelegramMessage(msg)) {
      return;
    }

    try {
      const result = await onMessage({
        chatId,
        senderName: msg.from?.first_name || 'Customer',
        message: text,
        channel: 'telegram',
      });

      if (result?.reply) {
        await bot.sendMessage(chatId, result.reply, {
          parse_mode: 'HTML',
        });
      }
    } catch (error) {
      console.error('Telegram send error:', error);
      await bot.sendMessage(chatId, 'I am temporarily unavailable. Please try again later.');
    }
  });

  return bot;
}
