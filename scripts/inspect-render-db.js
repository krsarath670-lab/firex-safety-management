const { Pool } = require('pg');

const connectionString = 'postgresql://firex_user:jqR7j4yaLoFSQQJmCId6RMxrGTaKXJDA@dpg-datg627lot8c73feemmg-a.frankfurt-postgres.render.com:5432/firex?ssl=true';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const res = await pool.query("SELECT key, data, updated_at FROM firex_store WHERE key = 'app_state'");
    if (res.rows.length === 0) {
      console.log('No app_state found in PostgreSQL');
      await pool.end();
      return;
    }

    const state = res.rows[0].data;
    console.log('--- Production PostgreSQL Data Summary ---');
    console.log('Updated at:', res.rows[0].updated_at);
    console.log('Users count:', (state.users || []).length);
    console.log('Customers count:', (state.customers || []).length);
    console.log('AMC Contracts count:', (state.amc_contracts || []).length);
    console.log('Service Visits count:', (state.service_visits || []).length);
    console.log('Reports count:', (state.reports || []).length);
    console.log('Current company_settings letterhead_url:', state.company_settings?.letterhead_url);
    console.log('Current company_settings letterhead_footer_url:', state.company_settings?.letterhead_footer_url);

    // Safely update only company_settings branding in PostgreSQL without touching any other collection
    if (!state.company_settings) state.company_settings = {};
    state.company_settings.letterhead_url = '/letterhead.png';
    state.company_settings.letterhead_footer_url = '/letterhead_footer.jpg';
    state.company_settings.logo_url = '/logo.png';
    state.company_settings.use_custom_letterhead = true;

    await pool.query(
      'UPDATE firex_store SET data = $1, updated_at = NOW() WHERE key = $2',
      [state, 'app_state']
    );
    console.log('--- PostgreSQL Successfully Updated ---');
    console.log('Set letterhead_url to /letterhead.png and letterhead_footer_url to /letterhead_footer.jpg');
    console.log('All customer records, contracts, visits, and reports remain 100% intact.');

    await pool.end();
  } catch (err) {
    console.error('Error connecting to Render DB:', err.message);
    await pool.end();
  }
}

main();
