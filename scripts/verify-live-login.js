const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function verifyLive() {
  const baseUrl = 'https://fires-angle-principles-literary.trycloudflare.com';
  console.log('Testing live public HTTPS endpoint:', baseUrl);

  // 1. Check index.html
  const htmlRes = await get(`${baseUrl}/`);
  console.log('1. Index HTML Status:', htmlRes.status);
  console.log('   Cache-Control:', htmlRes.headers['cache-control']);
  console.log('   Contains new bundle (index-B6oaUavu.js)?', htmlRes.body.includes('index-B6oaUavu.js'));

  // 2. Check sw.js
  const swRes = await get(`${baseUrl}/sw.js`);
  console.log('2. Service Worker Status:', swRes.status);
  console.log('   SW Version:', swRes.body.match(/firex-safety-v\d+/)?.[0]);

  // 3. Check users-list
  const usersRes = await get(`${baseUrl}/api/auth/users-list`);
  console.log('3. Users List Status:', usersRes.status, 'Count:', JSON.parse(usersRes.body).length);
}

verifyLive().catch(console.error);
