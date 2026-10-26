const https = require('https');

const BASE_URL = 'https://firex-safety-management.onrender.com';

function fetchUrl(urlPath) {
  return new Promise((resolve, reject) => {
    https.get(`${BASE_URL}${urlPath}`, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          buffer,
          text: buffer.toString('utf8')
        });
      });
    }).on('error', reject);
  });
}

async function verifyLive() {
  console.log(`=== Probing Render Live App: ${BASE_URL} ===`);
  
  // 1. Health check
  try {
    const health = await fetchUrl('/api/health');
    console.log('[1/5] Health Check:', health.statusCode, health.text);
  } catch (e) {
    console.log('[1/5] Health Check failed:', e.message);
  }

  // 2. Settings check
  try {
    const settings = await fetchUrl('/api/settings');
    console.log('[2/5] Settings Status:', settings.statusCode);
    const parsed = JSON.parse(settings.text);
    console.log('       company_name:', parsed.company_name);
    console.log('       letterhead_url:', parsed.letterhead_url);
    console.log('       letterhead_footer_url:', parsed.letterhead_footer_url);
    console.log('       logo_url:', parsed.logo_url);
  } catch (e) {
    console.log('[2/5] Settings check failed:', e.message);
  }

  // 3. Static Letterhead
  try {
    const lh = await fetchUrl('/letterhead.png');
    console.log('[3/5] Static Letterhead:', lh.statusCode, 'Content-Type:', lh.headers['content-type'], 'Size (bytes):', lh.buffer.length);
  } catch (e) {
    console.log('[3/5] Static Letterhead failed:', e.message);
  }

  // 4. Static Footer
  try {
    const footer = await fetchUrl('/letterhead_footer.jpg');
    console.log('[4/5] Static Footer:', footer.statusCode, 'Content-Type:', footer.headers['content-type'], 'Size (bytes):', footer.buffer.length);
  } catch (e) {
    console.log('[4/5] Static Footer failed:', e.message);
  }

  // 5. Static Logo
  try {
    const logo = await fetchUrl('/logo.png');
    console.log('[5/5] Static Logo:', logo.statusCode, 'Content-Type:', logo.headers['content-type'], 'Size (bytes):', logo.buffer.length);
  } catch (e) {
    console.log('[5/5] Static Logo failed:', e.message);
  }
}

verifyLive();
