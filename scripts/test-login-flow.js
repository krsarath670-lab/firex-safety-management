const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9335;
const TARGET_URL = 'https://firex-safety-management.onrender.com';
const USER_DATA = path.join(__dirname, '..', '..', 'chrome_test_profile3');

async function main() {
  console.log('Testing Sign In with React state trigger in headless Chrome...');
  const chromeProc = spawn(CHROME, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA}`,
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const versionRes = await fetch(`http://127.0.0.1:${PORT}/json/new?${TARGET_URL}`, { method: 'PUT' });
    const target = await versionRes.json();
    const ws = new WebSocket(target.webSocketDebuggerUrl);

    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

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
        console.log(`[CONSOLE ${data.params.type.toUpperCase()}]:`, args);
      }
      if (data.method === 'Runtime.exceptionThrown') {
        console.error('[EXCEPTION]:', JSON.stringify(data.params.exceptionDetails));
      }
      if (data.method === 'Network.responseReceived') {
        if (data.params.response.url.includes('/api/')) {
          console.log(`[API RESPONSE ${data.params.response.status}]:`, data.params.response.url);
        }
      }
    });

    await send('Runtime.enable');
    await send('Network.enable');
    await send('Page.enable');

    console.log('Navigating to', TARGET_URL);
    await send('Page.navigate', { url: TARGET_URL });
    await new Promise(r => setTimeout(r, 3000));

    // Fill inputs using React's native value setter
    const fillRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const setReactValue = (el, val) => {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        };

        const inputs = document.querySelectorAll('input');
        if (inputs.length >= 2) {
          setReactValue(inputs[0], 'admin');
          setReactValue(inputs[1], '1234');
          
          const btn = document.querySelector('button[type=\"submit\"]');
          if (btn) {
            btn.click();
            return 'Clicked submit with admin / 1234';
          }
        }
        return 'Inputs not found';
      })()`
    });
    console.log('Fill result:', fillRes?.result?.value);

    // Wait 5 seconds for login and dashboard to load
    await new Promise(r => setTimeout(r, 5000));

    // Evaluate dashboard content
    const dashText = await send('Runtime.evaluate', {
      expression: 'document.body ? document.body.innerText.slice(0, 800) : "NO BODY"'
    });
    console.log('Page visible text after Sign In:\n', dashText?.result?.value);

    // Take screenshot of dashboard
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    if (screenshot && screenshot.data) {
      const buf = Buffer.from(screenshot.data, 'base64');
      const shotPath = path.join(__dirname, '..', '..', 'logged_in_dashboard.png');
      fs.writeFileSync(shotPath, buf);
      console.log('Saved dashboard screenshot to', shotPath, 'bytes:', buf.length);
    }

    ws.close();
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    chromeProc.kill();
    console.log('Finished.');
  }
}

main();
