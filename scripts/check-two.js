const { Client } = require('pg');
const dbUrl = 'postgresql://firex_user:jqR7j4yaLoFSQQJmCId6RMxrGTaKXJDA@dpg-datg627lot8c73feemmg-a.frankfurt-postgres.render.com:5432/firex?ssl=true';

async function check() {
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query("SELECT data FROM firex_store WHERE key = 'app_state'");
  const users = res.rows[0].data.users || [];
  const c = users.find(u => (u.username||'').toLowerCase() === 'chandiramohan');
  const s = users.find(u => (u.username||'').toLowerCase() === 'sarath');
  console.log('Chandiramohan:', { id: c.id, username: c.username, password: c.password, pin: c.pin, updated_at: c.password_updated_at });
  console.log('sarath:', { id: s.id, username: s.username, password: s.password, pin: s.pin, updated_at: s.password_updated_at });
  await client.end();
}
check().catch(console.error);
