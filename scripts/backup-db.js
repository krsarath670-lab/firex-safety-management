const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'server', 'data', 'database.json');
const BACKUPS_DIR = path.join(__dirname, '..', 'backups');

if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

function createBackup() {
  if (!fs.existsSync(DB_PATH)) {
    console.error(`Database file not found at ${DB_PATH}`);
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `backup-${timestamp}.json`;
  const backupPath = path.join(BACKUPS_DIR, backupFileName);

  const rawData = fs.readFileSync(DB_PATH, 'utf8');
  // Validate that it's valid JSON
  try {
    JSON.parse(rawData);
  } catch (err) {
    console.error('Database file contains invalid JSON:', err);
    process.exit(1);
  }

  fs.writeFileSync(backupPath, rawData, 'utf8');
  const sizeKb = (Buffer.byteLength(rawData) / 1024).toFixed(2);
  console.log(`[FIREX BACKUP] Backup successfully created!`);
  console.log(`- File: ${backupPath}`);
  console.log(`- Size: ${sizeKb} KB`);
  console.log(`- Timestamp: ${new Date().toLocaleString()}`);
  return backupPath;
}

function listBackups() {
  const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.endsWith('.json'));
  console.log(`Available backups (${files.length}):`);
  files.forEach(f => {
    const stats = fs.statSync(path.join(BACKUPS_DIR, f));
    console.log(`- ${f} (${(stats.size / 1024).toFixed(2)} KB, created ${stats.mtime.toLocaleString()})`);
  });
}

function restoreBackup(fileName) {
  const backupPath = path.isAbsolute(fileName) ? fileName : path.join(BACKUPS_DIR, fileName);
  if (!fs.existsSync(backupPath)) {
    console.error(`Backup file not found at ${backupPath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(backupPath, 'utf8');
  JSON.parse(rawData); // Validate JSON

  // Make a pre-restore backup of the current state
  createBackup();

  fs.writeFileSync(DB_PATH, rawData, 'utf8');
  console.log(`[FIREX RESTORE] Successfully restored database from ${backupPath}`);
}

const args = process.argv.slice(2);
if (args[0] === 'list') {
  listBackups();
} else if (args[0] === 'restore') {
  if (!args[1]) {
    console.error('Please specify the backup filename to restore: node scripts/backup-db.js restore <filename>');
    process.exit(1);
  }
  restoreBackup(args[1]);
} else {
  createBackup();
}
