const https = require('https');
const fs = require('fs');

async function testUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, headers: res.headers, body: data });
      });
    }).on('error', (err) => {
      resolve({ error: err.message });
    });
  });
}

async function run() {
  console.log('Testing index.html:');
  const indexRes = await testUrl('https://serum-enormous-attempts-thirty.trycloudflare.com/');
  console.log('Status:', indexRes.status);
  console.log('Headers:', indexRes.headers);
  
  if (indexRes.body) {
    const scripts = [];
    const re = /<script[^>]+src=["']([^"']+)["']/g;
    let match;
    while ((match = re.exec(indexRes.body)) !== null) {
      scripts.push(match[1]);
    }
    console.log('Found scripts:', scripts);

    for (const src of scripts) {
      const fullUrl = 'https://serum-enormous-attempts-thirty.trycloudflare.com' + src;
      const sRes = await testUrl(fullUrl);
      console.log(`Script ${src} -> Status: ${sRes.status}, Size: ${sRes.body ? sRes.body.length : 0}`);
    }

    const cssList = [];
    const cssRe = /<link[^>]+href=["']([^"']+\.css)["']/g;
    while ((match = cssRe.exec(indexRes.body)) !== null) {
      cssList.push(match[1]);
    }
    console.log('Found CSS:', cssList);
    for (const href of cssList) {
      const fullUrl = 'https://serum-enormous-attempts-thirty.trycloudflare.com' + href;
      const cRes = await testUrl(fullUrl);
      console.log(`CSS ${href} -> Status: ${cRes.status}, Size: ${cRes.body ? cRes.body.length : 0}`);
    }
  }
}

run();
