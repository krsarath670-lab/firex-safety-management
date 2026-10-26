const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const { app } = require('../server/index');

const LOCAL_PORT = 5055;
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CHROME_PORT = 9336;
const USER_DATA = path.join(__dirname, '..', '..', 'chrome_test_profile_local');

async function main() {
  const server = app.listen(LOCAL_PORT, () => {
    console.log(`Local test server running on http://127.0.0.1:${LOCAL_PORT}`);
  });

  const chromeProc = spawn(CHROME, [
    '--headless=new',
    `--remote-debugging-port=${CHROME_PORT}`,
    `--user-data-dir=${USER_DATA}`,
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const targetUrl = `http://127.0.0.1:${LOCAL_PORT}`;
    const versionRes = await fetch(`http://127.0.0.1:${CHROME_PORT}/json/new?${targetUrl}`, { method: 'PUT' });
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
    });

    await send('Runtime.enable');
    await send('Page.enable');

    console.log('Navigating to', targetUrl);
    await send('Page.navigate', { url: targetUrl });
    await new Promise(r => setTimeout(r, 2000));

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

    // Wait 3 seconds for dashboard to load
    await new Promise(r => setTimeout(r, 3000));

    // Evaluate dashboard content
    const dashText = await send('Runtime.evaluate', {
      expression: 'document.body ? document.body.innerText.slice(0, 1000) : "NO BODY"'
    });
    console.log('--- Page text after login: ---\n', dashText?.result?.value);

    ws.close();
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    chromeProc.kill();
    server.close();
    console.log('Local test server and Chrome closed.');
    process.exit(0);
  }
}

main();
