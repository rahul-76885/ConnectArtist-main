const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const vm = require('vm');

function readHtml() {
  const p = path.join(__dirname, '..', 'public', 'PaymentDetailsBox.html');
  return fs.readFileSync(p, 'utf8');
}

async function runDirectOpenTest(html) {
  console.log('\n=== Direct open test ===');
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('log', (msg) => console.log('[page log]', msg));
  virtualConsole.on('error', (err) => console.error('[page error]', err && err.stack ? err.stack : err));
  virtualConsole.on('warn', (w) => console.warn('[page warn]', w));

  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', virtualConsole });
  const win = dom.window;

  let errorCaught = false;
  win.addEventListener('error', (e) => {
    console.error('Window error event:', e && e.error ? e.error.stack || e.error : e);
    errorCaught = true;
  });

  // Wait briefly for scripts to run
  await new Promise((res) => setTimeout(res, 500));

  if (!errorCaught) {
    console.log('Direct open: no uncaught window errors detected (within timeout).');
  } else {
    console.error('Direct open: an error was detected during load.');
  }
}

async function runInjectedHostTest(html) {
  console.log('\n=== Injected-host test ===');
  // Create a host page and manually inject the body of PaymentDetailsBox
  // We'll extract the scripts and evaluate them after creating required elements

  // Extract body content
  const bodyMatch = html.match(/<body[^>]*>[\s\S]*<\/body>/i);
  const bodyHtml = bodyMatch ? bodyMatch[0].replace(/^<body[^>]*>/i, '').replace(/<\/body>$/i, '') : html;

  // Extract all inline script contents
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  const scripts = [];
  let m;
  while ((m = scriptRegex.exec(html)) !== null) {
    scripts.push(m[1]);
  }

  const hostHtml = `<!doctype html><html><head></head><body><div id="hostRoot"></div></body></html>`;
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('log', (msg) => console.log('[host log]', msg));
  virtualConsole.on('error', (err) => console.error('[host error]', err && err.stack ? err.stack : err));
  virtualConsole.on('warn', (w) => console.warn('[host warn]', w));

  const dom = new JSDOM(hostHtml, { runScripts: 'outside-only', resources: 'usable', virtualConsole });
  const win = dom.window;
  const doc = win.document;

  // Create the expected container elements BEFORE running the payment UI scripts
  const container = doc.getElementById('hostRoot');
  // simulate the host adding the payment box content
  container.innerHTML = bodyHtml;

  // Ensure the specific elements are present for initPrimaryPaymentUI
  // If PaymentDetailsBox normally relies on other IDs, we create stubs as needed
  if (!doc.getElementById('yourPaymentList')) {
    const el = doc.createElement('div');
    el.id = 'yourPaymentList';
    container.appendChild(el);
  }
  if (!doc.getElementById('savePrimaryPayment')) {
    const btn = doc.createElement('button');
    btn.id = 'savePrimaryPayment';
    btn.textContent = 'Save Primary';
    container.appendChild(btn);
  }

  // Expose a simple showStatusMessage used by the payment script if present
  win.showStatusMessage = function(msg, type) {
    // log to virtual console
    console.log('showStatusMessage:', type, msg);
  };

  // Run extracted inline scripts in order
  try {
    for (const s of scripts) {
      // Evaluate script inside the window
      dom.runVMScript(new vm.Script(s));
    }
  } catch (err) {
    console.error('Error while evaluating scripts in host context:', err.stack || err);
  }

  // If initPrimaryPaymentUI exists, call it (it should attach handlers)
  if (typeof win.initPrimaryPaymentUI === 'function') {
    try {
      win.initPrimaryPaymentUI();
      console.log('Called initPrimaryPaymentUI() successfully.');
    } catch (err) {
      console.error('initPrimaryPaymentUI threw:', err.stack || err);
    }
  } else {
    console.warn('initPrimaryPaymentUI not defined in injected scripts.');
  }

  // Simulate clicking the save button to ensure listener works and localStorage is set
  try {
    const saveBtn = doc.getElementById('savePrimaryPayment');
    if (saveBtn) {
      // select a dummy radio to trigger no-selection vs selection behavior
      const radio = doc.createElement('input');
      radio.type = 'radio';
      radio.name = 'primaryPayment';
      radio.value = 'upi';
      doc.getElementById('yourPaymentList').appendChild(radio);

      // simulate checking it
      radio.checked = true;

      // click
      const evt = new win.Event('click');
      saveBtn.dispatchEvent(evt);

      // check localStorage
      const stored = win.localStorage.getItem('primaryPaymentMethod');
      console.log('localStorage.primaryPaymentMethod =', stored);
    } else {
      console.warn('savePrimaryPayment button missing in host DOM');
    }
  } catch (err) {
    console.error('Error during simulated click:', err.stack || err);
  }
}

(async function main() {
  const html = readHtml();
  await runDirectOpenTest(html);
  await runInjectedHostTest(html);
  console.log('\nTests complete');
})();
