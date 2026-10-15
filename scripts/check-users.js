const { Client } = require('pg');
const dbUrl = 'postgresql://firex_user:jqR7j4yaLoFSQQJmCId6RMxrGTaKXJDA@dpg-datg627lot8c73feemmg-a.frankfurt-postgres.render.com:5432/firex?ssl=true';

async function check() {
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query("SELECT data FROM firex_store WHERE key = 'app_state'");
  const data = res.rows[0].data;
  console.log('Postgres users count:', (data.users || []).length);
  (data.users || []).forEach(u => {
    console.log(u.username, '|', u.name, '|', u.role, '| status:', u.status, '| pass_prefix:', (u.password || '').slice(0, 15));
  });
  await client.end();
}
check().catch(console.error);
