import fs from 'node:fs';
import dotenv from 'dotenv';
import { getSupabaseProjectReference } from '../server/databaseTargetGuard.js';

const names = ['.env', '.env.production', '.env.local', '.env.development.local', '.env.supabase.local', '.env.example'];
for (const name of names) {
  if (!fs.existsSync(name)) continue;
  const contents = fs.readFileSync(name, 'utf8');
  const parsed = dotenv.parse(contents);
  const dbDeclarations = contents.split(/\r?\n/).filter((line) => /^\s*(?:export\s+)?DATABASE_URL\s*=/.test(line));
  const url = parsed.DATABASE_URL;
  const reference = url ? getSupabaseProjectReference(url) : null;
  const protectedInfo = ['ZIYOTECH_ALLOW_NONPRODUCTION_DATABASE', 'ZIYOTECH_NONPRODUCTION_PROJECT_REF'];
  console.log(`${name}: DATABASE_URL declarations=${dbDeclarations.length}, parsed=${Boolean(url)}, projectRef=${reference || 'none'}`);
  for (const key of protectedInfo) {
    if (Object.hasOwn(parsed, key)) console.log(`  ${key}=${parsed[key]}`);
  }
  if (Object.hasOwn(parsed, 'NODE_ENV')) console.log(`  NODE_ENV=${parsed.NODE_ENV}`);
}

console.log(`process.env DATABASE_URL: set=${Boolean(process.env.DATABASE_URL)}, projectRef=${getSupabaseProjectReference(process.env.DATABASE_URL) || 'none'}`);
for (const key of ['ZIYOTECH_ALLOW_NONPRODUCTION_DATABASE', 'ZIYOTECH_NONPRODUCTION_PROJECT_REF', 'NODE_ENV']) {
  if (Object.hasOwn(process.env, key)) console.log(`process.env ${key}=${process.env[key]}`);
}
console.log(`production runtime markers: RENDER=${Boolean(process.env.RENDER)}, RENDER_SERVICE_ID=${Boolean(process.env.RENDER_SERVICE_ID)}`);
