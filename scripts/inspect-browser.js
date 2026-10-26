const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9333;
const TARGET_URL = 'https://firex-safety-management.onrender.com';
const USER_DATA = path.join(__dirname, '..', '..', 'chrome_test_profile');

async function main() {
  console.log('Launching headless Chrome on port', PORT);
  const chromeProc = spawn(CHROME, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA}`,
    '--disable-gpu',
    '--no-sandbox',
    '--disable-extensions',
    'about:blank'
  ]);

  // Wait for Chrome to listen
  await new Promise(r => setTimeout(r, 2000));

  try {
    // Get version / target
    const versionRes = await fetch(`http://127.0.0.1:${PORT}/json/new?${TARGET_URL}`, { method: 'PUT' });
    const target = await versionRes.json();
    console.log('Created page target:', target.id);

    const wsUrl = target.webSocketDebuggerUrl;
    console.log('Connecting CDP WebSocket:', wsUrl);

    const ws = new WebSocket(wsUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    console.log('Connected to CDP!');

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const msgId = id++;
        const handler = (event) => {
          const data = JSON.parse(event.data);
          if (data.id === msgId) {
            ws.removeEventListener('message', handler);
            resolve(data.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        const args = (data.params.args || []).map(a => a.value || a.description || JSON.stringify(a)).join(' ');
        console.log(`[BROWSER CONSOLE ${data.params.type.toUpperCase()}]:`, args);
      }
      if (data.method === 'Runtime.exceptionThrown') {
        console.error('[BROWSER EXCEPTION]:', JSON.stringify(data.params.exceptionDetails));
      }
      if (data.method === 'Network.responseReceived') {
        if (data.params.response.status >= 400) {
          console.warn(`[BROWSER HTTP ${data.params.response.status}]:`, data.params.response.url);
        }
      }
    });

    await send('Runtime.enable');
    await send('Network.enable');
    await send('Page.enable');

    console.log('Navigating to', TARGET_URL);
    await send('Page.navigate', { url: TARGET_URL });

    // Wait 6 seconds for page to render
    await new Promise(r => setTimeout(r, 6000));

    // Capture screenshot
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    if (screenshot && screenshot.data) {
      const buf = Buffer.from(screenshot.data, 'base64');
      const shotPath = path.join(__dirname, '..', '..', 'browser_screenshot.png');
      fs.writeFileSync(shotPath, buf);
      console.log('Saved screenshot to', shotPath, 'bytes:', buf.length);
    }

    // Evaluate root element content
    const evalRes = await send('Runtime.evaluate', {
      expression: 'document.getElementById("root") ? document.getElementById("root").innerHTML.slice(0, 500) : "NO ROOT"'
    });
    console.log('Root HTML snippet:', evalRes?.result?.value);

    // Evaluate full text on page
    const textRes = await send('Runtime.evaluate', {
      expression: 'document.body ? document.body.innerText.slice(0, 500) : "NO BODY"'
    });
    console.log('Page visible text:', textRes?.result?.value);

    ws.close();
  } catch (err) {
    console.error('Error during browser inspection:', err);
  } finally {
    chromeProc.kill();
    console.log('Closed Chrome.');
  }
}

main();
