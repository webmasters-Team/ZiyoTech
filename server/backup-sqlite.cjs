const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');

async function main() {
  const source = path.resolve(__dirname, 'ziyo_sales_ai.db');

  if (!fs.existsSync(source)) {
    throw new Error(`Database not found: ${source}`);
  }

  const directory = path.resolve(__dirname, 'backups');
  fs.mkdirSync(directory, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const destination = path.join(
    directory,
    `ziyo_sales_ai_${timestamp}.db`
  );

  const db = new Database(source, {
    readonly: true,
    fileMustExist: true
  });

  try {
    await db.backup(destination);

    const backup = new Database(destination, {
      readonly: true,
      fileMustExist: true
    });

    try {
      console.log('Backup:', destination);
      console.log('Integrity:', backup.pragma('integrity_check'));
      console.log('Tables:', backup.prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table'"
      ).all());
    } finally {
      backup.close();
    }
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error('Backup failed:', error.message);
  process.exitCode = 1;
});
