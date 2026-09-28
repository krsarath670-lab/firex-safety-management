const https = require('https');

const baseUrl = 'https://fires-angle-principles-literary.trycloudflare.com';
const paths = ['/api/jobs', '/api/amc', '/api/reports', '/api/faults', '/api/dashboard/stats'];

paths.forEach(p => {
  https.get(baseUrl + p, { headers: { 'x-user-role': 'GM' } }, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        console.log(`${p}: ${parsed.length} items`);
      } else {
        console.log(`${p}:`, parsed);
      }
    });
  });
});
