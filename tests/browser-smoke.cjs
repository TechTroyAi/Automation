/* Optional integration test: npm install --no-save --package-lock=false playwright@1.63.0 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');

(async () => {
  // A short-lived test fixture, deliberately served below /Automation/ like Pages.
  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://test');
      if (!url.pathname.startsWith('/Automation/')) throw new Error('not found');
      const relative = decodeURIComponent(url.pathname.slice('/Automation/'.length)) || 'index.html';
      const file = path.resolve(root, relative);
      if (!file.startsWith(root + path.sep)) throw new Error('not found');
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png' };
      response.setHeader('Content-Type', types[path.extname(file)] || 'text/plain');
      response.end(await fs.readFile(file));
    } catch { response.writeHead(404); response.end('Not found'); }
  });
  await new Promise(resolve => server.listen(0, '0.0.0.0', resolve));
  let browser;
  try {
    let launch = { headless: true };
    // Optional sandbox fallback when the Playwright browser CDN is unavailable.
    if (process.env.USE_PACKAGED_CHROMIUM === '1') {
      const imported = require('@sparticuz/chromium');
      const packaged = imported.default || imported;
      const libraryArchive = path.resolve(path.dirname(require.resolve('@sparticuz/chromium')), '../bin/al2023.tar.br');
      const libraries = await imported.inflate(libraryArchive);
      imported.setupLambdaEnvironment(path.join(libraries, 'lib'));
      launch = { ...launch, executablePath: await packaged.executablePath(),
        args: packaged.args.filter(arg => arg !== '--single-process' && arg !== '--disable-web-security') };
    }
    browser = await chromium.launch(launch);
    const base = `http://127.0.0.1:${server.address().port}/Automation/`;
    const errors = [];
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    page.on('pageerror', error => errors.push(error.message));
    const requests = [];
    page.on('request', request => requests.push(request.url()));
    await page.goto(base);
    assert.equal(await page.locator('#quickRow button').count(), 6);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    const send = async text => {
      await page.locator('#chatText').fill(text);
      await page.locator('#chatText').press('Enter');
      await page.waitForFunction(() => !document.querySelector('.typing'));
      return page.locator('#chatBody .bot').last().innerText();
    };
    const expected = ['Here’s our menu', 'Our regular hours', 'Delivery is ₱50', 'Need to cancel', 'Starter FAQ bot', 'You’ll need to send the message there'];
    for (let i = 0; i < expected.length; i++) {
      await page.locator('#quickRow button').nth(i).click();
      await page.waitForFunction(() => !document.querySelector('.typing'));
      assert.ok((await page.locator('#chatBody .bot').last().innerText()).includes(expected[i]), expected[i]);
    }
    assert.match(await send('Hi how much is delivery?'), /Delivery is ₱50/);
    assert.match(await send('hours and location'), /Which one would you like to start with/);
    assert.match(await send('this is a spaceship'), /Could you rephrase that/);
    assert.match(await send('Can I order?'), /Of course! 🧋 What would you like/);
    assert.doesNotMatch(await page.locator('#chatBody .bot').last().innerText(), /This demo|Do not enter/);
    assert.match(await page.locator('#demoPrivacy').innerText(), /no real orders, payments, or staff handoffs/);
    assert.match(await page.locator('#demoPrivacy').innerText(), /never personal or payment information/);
    const requestCount = requests.length;
    const payload = '<img src=x onerror="window.__xss=1">';
    await send(payload);
    assert.equal(await page.locator('#chatBody .user').last().textContent(), payload);
    assert.equal(await page.locator('#chatBody img').count(), 0);
    assert.equal(await page.evaluate(() => window.__xss), undefined);
    assert.equal(requests.length, requestCount, 'Sending a message must not make a network request');
    const before = await page.locator('#chatBody .msg').count();
    await page.locator('#chatText').fill('   ');
    await page.locator('#chatForm button').click();
    assert.equal(await page.locator('#chatBody .msg').count(), before);
    assert.equal(await page.locator('#chatText').getAttribute('maxlength'), '200');
    assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0);
    await page.reload();
    assert.equal(await page.locator('#chatBody .user').count(), 0);

    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No mobile overflow');
    await page.locator('#navToggle').click();
    assert.equal(await page.locator('#navToggle').getAttribute('aria-expanded'), 'true');
    await page.locator('#navLinks a[href="#work"]').click();
    assert.equal(await page.locator('#navToggle').getAttribute('aria-expanded'), 'false');
    assert.ok(await page.locator('#work').isVisible());
    assert.match(await send('Please cancel this order'), /They’ll need to confirm/);
    if (process.env.SMOKE_SCREENSHOT) await page.screenshot({ path: process.env.SMOKE_SCREENSHOT, fullPage: true });

    const broken = await browser.newPage();
    await broken.route('**/assets/chatbot-data.js', route => route.abort());
    await broken.goto(base);
    await broken.locator('#chatText').fill('menu');
    await broken.locator('#chatText').press('Enter');
    await broken.waitForFunction(() => !document.querySelector('.typing'));
    assert.match(await broken.locator('#chatBody .bot').last().innerText(), /scripts could not load/);

    const noJS = await browser.newPage({ javaScriptEnabled: false });
    await noJS.goto(base);
    assert.match(await noJS.locator('.phone noscript').innerText(), /JavaScript is needed/);
    assert.equal(await noJS.locator('#contact .reveal').evaluate(el => getComputedStyle(el).opacity), '1');
    assert.equal(await noJS.locator('.phone').evaluate(el => getComputedStyle(el).opacity), '1');
    await noJS.close();
    const offline = await browser.newContext({ offline: true });
    const local = await offline.newPage();
    await local.goto(pathToFileURL(path.join(root, 'index.html')).href);
    await local.locator('#chatText').fill('chatbot pricing');
    await local.locator('#chatText').press('Enter');
    await local.waitForFunction(() => !document.querySelector('.typing'));
    assert.match(await local.locator('#chatBody .bot').last().innerText(), /Starter FAQ bot/);
    await offline.close();
    assert.deepEqual(errors, []);
    console.log('Browser smoke passed: project path, desktop/mobile, quick replies, form, XSS, privacy, missing scripts, no-JS, and offline file usage.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
