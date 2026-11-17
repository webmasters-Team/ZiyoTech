const fs = require('fs');
const path = require('path');
const Database = require(require.resolve('better-sqlite3', { paths: ['C:\\Users\\doniy\\Downloads\\my_company'] }));

const rootDir = 'C:\\Users\\doniy\\Downloads\\my_company';
const sourcePath = path.join(rootDir, 'server', 'ziyo_sales_ai.db');
const backupDir = path.join(rootDir, 'backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(backupDir, `ziyo_sales_ai_${timestamp}.db`);

function logResult(label, value) {
  console.log(`${label}=${value}`);
}

(async () => {
  try {
    fs.mkdirSync(backupDir, { recursive: true });
    logResult('SOURCE_PATH', sourcePath);
    logResult('BACKUP_PATH', backupPath);

    const srcDb = new Database(sourcePath, { readonly: true, fileMustExist: true });
    const backupDb = new Database(backupPath);

    try {
      srcDb.backup(backupDb);
      logResult('BACKUP_STATUS', 'SUCCESS');
    } finally {
      srcDb.close();
      backupDb.close();
    }

    const inspectDb = new Database(backupPath, { readonly: true, fileMustExist: true });
    try {
      const integrity = inspectDb.prepare('PRAGMA integrity_check;').get();
      const tables = inspectDb.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
      logResult('INTEGRITY_CHECK', integrity.integrity_check);
      logResult('TABLE_COUNT', String(tables.length));
      logResult('TABLES', JSON.stringify(tables.map((row) => row.name)));
    } finally {
      inspectDb.close();
    }
  } catch (error) {
    console.error('BACKUP_ERROR=' + error && error.message ? error.message : String(error));
    if (error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
})();
