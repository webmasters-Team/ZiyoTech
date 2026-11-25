import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = path.dirname(serverDirectory);
const databasePath = path.join(serverDirectory, 'ziyo_sales_ai.db');
const migrationPath = path.join(serverDirectory, 'migrations', '003_client_project_management.sql');
const requiredTables = [
  'client_companies',
  'client_company_access_codes',
  'client_sessions',
  'client_access_attempt_limits',
  'client_projects',
  'client_project_milestones',
  'client_project_tasks',
  'client_project_progress_history',
  'client_project_updates',
  'client_project_resources',
  'client_project_activity_logs',
];

function tableNames(database) {
  return database.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all().map((row) => row.name);
}

function tableFingerprint(database, table) {
  const safeName = table.replaceAll('"', '""');
  const rows = database.prepare(`SELECT * FROM "${safeName}"`).all()
    .map((row) => JSON.stringify(row))
    .sort();
  return crypto.createHash('sha256').update(rows.join('\n')).digest('hex');
}

function integrity(database) {
  const check = database.pragma('integrity_check').map((row) => Object.values(row)[0]);
  const foreignKeys = database.pragma('foreign_key_check');
  return { valid: check.length === 1 && check[0] === 'ok' && foreignKeys.length === 0, foreignKeyViolations: foreignKeys.length };
}

function backupArgument(args) {
  const index = args.indexOf('--backup');
  return index >= 0 ? args[index + 1] : args.find((arg) => arg.startsWith('--backup='))?.slice('--backup='.length);
}

const args = process.argv.slice(2);
if (!args.includes('--apply')) {
  console.log('No changes made. After explicit owner approval, run with --apply --backup <fresh-backup-outside-repository>.');
  process.exit(0);
}
if (process.env.DATABASE_URL || process.env.NODE_ENV === 'production') {
  throw new Error('Refusing SQLite migration while PostgreSQL or production mode is configured.');
}

const backupPath = backupArgument(args);
if (!backupPath) throw new Error('A fresh backup path outside the repository is required with --backup.');
const resolvedBackupPath = path.resolve(backupPath);
if (resolvedBackupPath === databasePath || resolvedBackupPath.startsWith(`${repositoryDirectory}${path.sep}`)) {
  throw new Error('The required backup must be outside the repository and separate from the original database.');
}
if (!fs.existsSync(resolvedBackupPath)) throw new Error('The required SQLite backup file does not exist.');

const backup = new Database(resolvedBackupPath, { readonly: true, fileMustExist: true });
const database = new Database(databasePath, { fileMustExist: true });
try {
  backup.pragma('foreign_keys = ON');
  database.pragma('foreign_keys = ON');
  const backupIntegrity = integrity(backup);
  const databaseIntegrity = integrity(database);
  if (!backupIntegrity.valid || !databaseIntegrity.valid) throw new Error('The original database or its backup failed SQLite integrity checks.');

  const originalTables = tableNames(database);
  const backupTables = tableNames(backup);
  if (JSON.stringify(originalTables) !== JSON.stringify(backupTables)) throw new Error('The backup schema no longer matches the original database. Create a fresh backup.');
  if (!originalTables.includes('user_accounts')) throw new Error('The existing user_accounts table is missing; refusing migration.');
  if (requiredTables.some((name) => originalTables.includes(name))) throw new Error('Project Management tables already exist or are partially applied; refusing migration.');
  for (const table of originalTables) {
    if (tableFingerprint(database, table) !== tableFingerprint(backup, table)) throw new Error('The backup records no longer match the original database. Create a fresh backup.');
  }

  const migration = fs.readFileSync(migrationPath, 'utf8');
  const statements = migration.replace(/^\s*--.*$/gm, '').split(';').map((statement) => statement.trim()).filter(Boolean);
  if (statements.length === 0 || statements.some((statement) => !/^CREATE\s+(?:TABLE|(?:UNIQUE\s+)?INDEX)\b/i.test(statement))) {
    throw new Error('Migration contains a non-additive statement; refusing to apply it.');
  }

  const apply = database.transaction(() => {
    database.exec(migration);
    const createdTables = tableNames(database);
    if (requiredTables.some((name) => !createdTables.includes(name))) throw new Error('Migration did not create every required Project Management table.');
    for (const table of originalTables) {
      if (tableFingerprint(database, table) !== tableFingerprint(backup, table)) throw new Error('Migration changed existing records; transaction rolled back.');
    }
    const result = integrity(database);
    if (!result.valid) throw new Error('Migrated database failed integrity checks; transaction rolled back.');
  });
  apply();
  console.log('Project Management migration applied and validated.');
} finally {
  database.close();
  backup.close();
}
