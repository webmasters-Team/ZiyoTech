import dotenv from 'dotenv';
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { closeDatabase, initializeDatabase } from './db.js';
import { getActiveAdminAccounts, getAdminCredentialState, hashAdminPassword, saveAdminCredential } from './adminAuthService.js';

dotenv.config({ quiet: true });
dotenv.config({ path: '.env.supabase.local', quiet: true });

function hiddenPrompt(label) {
  return new Promise((resolve, reject) => {
    if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') return reject(new Error('Run this setup command in an interactive terminal so password input can be hidden.'));
    stdout.write(label);
    let value = '';
    const cleanup = () => {
      stdin.off('data', onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write('\n');
    };
    const onData = (chunk) => {
      for (const key of String(chunk)) {
        if (key === '\u0003') {
          cleanup();
          reject(new Error('Setup cancelled.'));
          return;
        } else if (key === '\r' || key === '\n') {
          cleanup();
          resolve(value);
          return;
        } else if (key === '\u007f' || key === '\b') {
          value = value.slice(0, -1);
        } else if (key !== '\u001b' && key >= ' ') {
          value += key;
        }
      }
    };
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on('data', onData);
  });
}

async function main() {
  await initializeDatabase();
  const args = process.argv.slice(2);
  const usernameIndex = args.indexOf('--username');
  const username = usernameIndex >= 0 ? args[usernameIndex + 1] : '';
  const accountIdIndex = args.indexOf('--account-id');
  const requestedAccountId = accountIdIndex >= 0 ? args[accountIdIndex + 1] : '';
  if (!username || !/^[A-Za-z0-9._-]{3,80}$/.test(username)) throw new Error('Usage: npm run setup:admin-credentials -- --username <admin-id> [--account-id <existing-admin-uid>]');

  const admins = await getActiveAdminAccounts();
  const account = requestedAccountId
    ? admins.find((item) => item.id === requestedAccountId)
    : admins.length === 1 ? admins[0] : null;
  if (!account) throw new Error(admins.length === 0
    ? 'No active PostgreSQL administrator exists. This command does not create or promote accounts.'
    : 'Select one existing admin explicitly with --account-id <uid>. This command does not create or promote accounts.');

  const existing = await getAdminCredentialState(account.id);
  let replace = false;
  if (existing) {
    const prompt = readline.createInterface({ input: stdin, output: stdout });
    const answer = await prompt.question('A credential already exists for this administrator. Replace it and revoke current admin sessions? Type REPLACE to confirm: ');
    prompt.close();
    if (answer !== 'REPLACE') throw new Error('Credential replacement was not confirmed. No database changes were made.');
    replace = true;
  }

  const password = await hiddenPrompt('New administrator password (minimum 14 characters): ');
  const confirmation = await hiddenPrompt('Confirm administrator password: ');
  if (password.length < 14) throw new Error('Choose a password with at least 14 characters. No database changes were made.');
  if (password !== confirmation) throw new Error('Passwords did not match. No database changes were made.');
  if (password.toLowerCase() === username.toLowerCase()) throw new Error('The password must differ from the Admin ID. No database changes were made.');

  const { passwordSalt, passwordHash } = await hashAdminPassword(password);
  await saveAdminCredential({ accountId: account.id, username, passwordSalt, passwordHash, replace });
  console.log('Administrator credentials saved for the existing active admin account. No account role or profile was changed.');
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Administrator credential setup failed.');
  process.exitCode = 1;
}

await closeDatabase();
