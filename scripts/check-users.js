const { Client } = require('pg');
const dbUrl = 'postgresql://firex_user:jqR7j4yaLoFSQQJmCId6RMxrGTaKXJDA@dpg-datg627lot8c73feemmg-a.frankfurt-postgres.render.com:5432/firex?ssl=true';

async function check() {
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query("SELECT data FROM firex_store WHERE key = 'app_state'");
  const data = res.rows[0].data;
  const admin = (data.users || []).find(u => u.username === 'admin');
  console.log('Admin user details:', JSON.stringify(admin, null, 2));
  console.log('_bulk_password_reset_v1:', data._bulk_password_reset_v1);
  await client.end();
}
check().catch(console.error);
