const { Client } = require('pg');
const dbUrl = 'postgresql://firex_user:jqR7j4yaLoFSQQJmCId6RMxrGTaKXJDA@dpg-datg627lot8c73feemmg-a.frankfurt-postgres.render.com:5432/firex?ssl=true';

async function check() {
  const c = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const res = await c.query("SELECT data FROM firex_store WHERE key = 'app_state'");
  const users = res.rows[0].data.users || [];
  for (const u of users) {
    console.log(u.username, '| role:', u.role, '| must_change:', u.must_change_password, '| temp:', u.temp_password_active, '| pass:', u.assigned_password);
  }
  await c.end();
}
check();
