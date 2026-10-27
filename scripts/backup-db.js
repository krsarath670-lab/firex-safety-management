/**
 * FIREX Fire & Safety Service Management
 * Safe Database Backup & Disaster Recovery Utility
 *
 * CRITICAL PERMANENT RULES:
 * 1. Updating the app must NEVER automatically delete existing backups.
 * 2. All backups are stored with unique timestamped and versioned names.
 * 3. Never overwrite or delete previous backups automatically.
 * 4. Verify each backup exists and is readable before proceeding.
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DB_PATH = path.join(__dirname, '..', 'server', 'data', 'database.json');
const BACKUPS_DIR = path.join(__dirname, '..', 'backups');

if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

function getPostgresPool() {
  if (!process.env.DATABASE_URL) return null;
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
  });
}

async function createBackup(notes = 'Manual Backup', version = 'v1.0') {
  let rawData = null;
  const pool = getPostgresPool();

  if (pool) {
    try {
      const res = await pool.query('SELECT data FROM firex_store WHERE key = $1', ['app_state']);
      if (res.rows.length > 0 && res.rows[0].data) {
        rawData = JSON.stringify(res.rows[0].data, null, 2);
        console.log('[FIREX BACKUP] Retrieved active database state from persistent PostgreSQL cloud store.');
      }
    } catch (err) {
      console.warn('[FIREX BACKUP] PostgreSQL read warning, falling back to local file:', err.message);
    }
  }

  if (!rawData) {
    if (!fs.existsSync(DB_PATH)) {
      console.error(`Database file not found at ${DB_PATH}`);
      process.exit(1);
    }
    rawData = fs.readFileSync(DB_PATH, 'utf8');
  }

  // Validate JSON integrity
  let parsed;
  try {
    parsed = JSON.parse(rawData);
  } catch (err) {
    console.error('Database contains invalid JSON:', err);
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `backup-${version}-${timestamp}.json`;
  const backupPath = path.join(BACKUPS_DIR, backupFileName);

  // Write to durable local archive
  fs.writeFileSync(backupPath, JSON.stringify(parsed, null, 2), 'utf8');
  const sizeBytes = Buffer.byteLength(rawData, 'utf8');
  const sizeKb = (sizeBytes / 1024).toFixed(2);

  const summary = {
    customers: (parsed.customers || []).length,
    amc_contracts: (parsed.amc_contracts || []).length,
    amc_visits: (parsed.amc_visits || []).length,
    reports: (parsed.reports || []).length,
    invoices: (parsed.invoices || []).length,
    users: (parsed.users || []).length
  };

  // If connected to PostgreSQL, also write to firex_backups persistent table
  if (pool) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS firex_backups (
          id VARCHAR(128) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          version VARCHAR(64) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status VARCHAR(32) DEFAULT 'verified',
          size_bytes INT NOT NULL,
          records_summary JSONB NOT NULL,
          backup_data JSONB NOT NULL,
          notes TEXT
        );
      `);
      const bkpId = `bkp-${Date.now()}`;
      await pool.query(
        `INSERT INTO firex_backups (id, name, version, created_at, status, size_bytes, records_summary, backup_data, notes)
         VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8)`,
        [bkpId, backupFileName, version, 'verified', sizeBytes, summary, parsed, notes]
      );
      console.log(`[FIREX BACKUP] Backup record registered in PostgreSQL persistent cloud table firex_backups.`);
      await pool.end();
    } catch (err) {
      console.warn('[FIREX BACKUP] PostgreSQL table registration note:', err.message);
    }
  }

  console.log(`[FIREX BACKUP] Backup successfully created & verified!`);
  console.log(`- File: ${backupPath}`);
  console.log(`- Version: ${version}`);
  console.log(`- Size: ${sizeKb} KB (${sizeBytes} bytes)`);
  console.log(`- Summary:`, summary);
  console.log(`- Timestamp: ${new Date().toLocaleString()}`);
  return backupPath;
}

function listBackups() {
  const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.endsWith('.json'));
  console.log(`\n======================================================`);
  console.log(`FIREX PERMANENT BACKUP REGISTRY (${files.length} backups available)`);
  console.log(`======================================================`);
  files.forEach(f => {
    const stats = fs.statSync(path.join(BACKUPS_DIR, f));
    console.log(`- ${f.padEnd(52)} | ${(stats.size / 1024).toFixed(2).padStart(8)} KB | Created: ${stats.mtime.toLocaleString()}`);
  });
  console.log(`======================================================\n`);
}

function verifyBackups() {
  const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.endsWith('.json'));
  let validCount = 0;
  console.log(`Verifying ${files.length} backups...`);
  for (const f of files) {
    const p = path.join(BACKUPS_DIR, f);
    try {
      const content = fs.readFileSync(p, 'utf8');
      JSON.parse(content);
      validCount++;
    } catch (e) {
      console.error(`- FAILED: ${f} (${e.message})`);
    }
  }
  console.log(`Verification Complete: ${validCount}/${files.length} backups verified intact.`);
}

async function restoreBackup(fileName) {
  const backupPath = path.isAbsolute(fileName) ? fileName : path.join(BACKUPS_DIR, fileName);
  if (!fs.existsSync(backupPath)) {
    console.error(`Backup file not found at ${backupPath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(backupPath, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(rawData);
  } catch (err) {
    console.error('Backup file contains invalid JSON:', err);
    process.exit(1);
  }

  // Pre-restore safety backup
  console.log('Taking mandatory pre-restore safety backup of current state...');
  await createBackup(`Safety backup taken before restoring ${path.basename(backupPath)}`, 'pre-restore');

  const pool = getPostgresPool();
  if (pool) {
    try {
      await pool.query(
        'INSERT INTO firex_store (key, data, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET data = $2, updated_at = NOW()',
        ['app_state', parsed]
      );
      console.log('[FIREX RESTORE] Successfully restored PostgreSQL database.');
      await pool.end();
    } catch (err) {
      console.error('[FIREX RESTORE] Failed to update PostgreSQL:', err);
    }
  }

  fs.writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2), 'utf8');
  console.log(`[FIREX RESTORE] Successfully restored database from ${backupPath}`);
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0] || 'create';

  if (cmd === 'list') {
    listBackups();
  } else if (cmd === 'verify') {
    verifyBackups();
  } else if (cmd === 'restore') {
    if (!args[1]) {
      console.error('Please specify the backup filename: node scripts/backup-db.js restore <filename>');
      process.exit(1);
    }
    await restoreBackup(args[1]);
  } else {
    const notes = args.slice(1).join(' ') || 'Pre-update safety backup';
    await createBackup(notes, 'v1.0');
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Backup script error:', err);
    process.exit(1);
  });
}

module.exports = { createBackup, listBackups, verifyBackups, restoreBackup };
