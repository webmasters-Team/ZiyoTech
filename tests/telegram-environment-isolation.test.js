import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createTelegramBot } from '../server/telegramBot.js';

test('Telegram token is read at integration initialization, after local env overrides', async () => {
  const source = await readFile(new URL('../server/telegramBot.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /dotenv\.config\s*\(/);
  assert.match(source, /export function createTelegramBot[\s\S]*?const TOKEN = process\.env\.TELEGRAM_BOT_TOKEN/);

  const previous = process.env.TELEGRAM_BOT_TOKEN;
  const previousWarn = console.warn;
  process.env.TELEGRAM_BOT_TOKEN = '';
  console.warn = () => {};
  try {
    assert.equal(createTelegramBot({ onMessage: async () => null }), null);
  } finally {
    console.warn = previousWarn;
    if (previous === undefined) delete process.env.TELEGRAM_BOT_TOKEN;
    else process.env.TELEGRAM_BOT_TOKEN = previous;
  }
});
