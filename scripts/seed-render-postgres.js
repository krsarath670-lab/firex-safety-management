const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://firex_user:jqR7j4yaLoFSQQJmCId6RMxrGTaKXJDA@dpg-datg627lot8c73feemmg-a.frankfurt-postgres.render.com:5432/firex?ssl=true';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('[RENDER POSTGRES] Connected successfully! Cloud DB Time:', res.rows[0].now);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS firex_store (
        key VARCHAR(64) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[RENDER POSTGRES] Table firex_store initialized on Render cloud PostgreSQL!');

    const localDbPath = path.join(__dirname, '..', 'server', 'data', 'database.json');
    const localData = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));

    await pool.query(
      'INSERT INTO firex_store (key, data, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET data = $2, updated_at = NOW()',
      ['app_state', localData]
    );
    console.log('[RENDER POSTGRES] Successfully migrated and seeded all FIREX data to Render cloud PostgreSQL database!');
    await pool.end();
  } catch (err) {
    console.error('[RENDER POSTGRES] Connection / Seed Error:', err);
  }
}

main();
