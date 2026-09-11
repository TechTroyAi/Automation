/* Optional integration test: npm install --no-save --package-lock=false playwright@1.63.0 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { pathToFileURL } = require('node:url');
const { chromium, devices } = require('playwright');
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
    assert.equal(await page.locator('#quickRow button').count(), 7);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    const send = async text => {
      await page.locator('#chatText').fill(text);
      await page.locator('#chatText').press('Enter');
      await page.waitForFunction(() => !document.querySelector('.typing'));
      return page.locator('#chatBody .bot').last().innerText();
    };
    const expected = ['Here’s our menu', 'Our regular hours', 'Delivery is ₱50', 'Need to cancel', 'Starter FAQ bot', 'You’ll need to send the message there', 'TOTAL: ₱230.00'];
    for (let i = 0; i < expected.length; i++) {
      await page.locator('#quickRow button').nth(i).click();
      await page.waitForFunction(() => !document.querySelector('.typing'));
      assert.ok((await page.locator('#chatBody .bot').last().innerText()).includes(expected[i]), expected[i]);
    }
    assert.match(await send('Hi how much is delivery?'), /Delivery is ₱50/);
    assert.match(await send('hours and location'), /Which one would you like to start with/);
    assert.match(await send('this is a spaceship'), /Could you rephrase that/);
    assert.match(await send('Can I order?'), /Of course! 🧋 Pick Classic/);
    // Messages from a real chat session: identity, flavors, short acknowledgements.
    assert.match(await send('whats your name?'), /Milk Tea Demo bot/);
    assert.match(await send('who made you??'), /Troy built me as a portfolio demo/);
    assert.match(await send('what are the flavors'), /Which fruits are available/);
    assert.match(await send('ok'), /Got it! 🧋/);
    assert.match(await send('ok po, magkano ang delivery fee?'), /Delivery is ₱50/);
    assert.doesNotMatch(await page.locator('#chatBody .bot').last().innerText(), /This demo|Do not enter/);
    assert.match(await page.locator('#demoPrivacy').innerText(), /no real orders, payments, or staff handoffs/);
    assert.match(await page.locator('#demoPrivacy').innerText(), /never personal or payment information/);
    assert.match(await send('2 Classic with extra pearls on each, plus delivery?'), /TOTAL: ₱230.00/);
    assert.doesNotMatch(await send('2 Classic and 1 taro, delivery'), /TOTAL:/);
    // Back-to-back chat quotes stay independent (no form state to reset).
    assert.match(await send('1 Okinawa and 2 Fruit Tea, pickup'), /TOTAL: ₱225.00/);
    assert.match(await send('5 Okinawa and 1 Classic, delivery'), /Delivery: ₱0.00/);
    assert.match(await page.locator('#chatBody .bot').last().innerText(), /TOTAL: ₱500.00/);
    // Friendly phrasing: filler words + Tagalog "at", then a one-word pickup/delivery follow-up.
    assert.match(await send('3 Wintermelon bro at 5 Fruit Tea sakin thx'), /Pickup or delivery/);
    assert.doesNotMatch(await page.locator('#chatBody .bot').last().innerText(), /TOTAL: ₱/);
    assert.match(await send('delivery'), /TOTAL: ₱605.00/);
    assert.match(await send('bro 1000000 fruit tea saa kinn'), /20 per line and 50 per order/);
    assert.doesNotMatch(await page.locator('#chatBody .bot').last().innerText(), /TOTAL: ₱/);
    // A pending order is dropped when the next message is an unrelated question.
    await send('bro 1 fruit tea nalang');
    assert.match(await send('delivery fee?'), /Delivery is ₱50/);
    // The demo section shows the milk tea chat only: the sample-quote form is gone.
    assert.equal(await page.locator('#demo .card').count(), 0);
    assert.equal(await page.locator('#quoteForm, #quoteResult, #quotePayment, #calculator').count(), 0);
    assert.doesNotMatch(await page.locator('#demo').innerText(), /Try the math|Build a sample quote|Show sample payment/i);
    const requestCount = requests.length;
    const payload = '<img src=x onerror="window.__xss=1">';
    await send(payload);
    assert.equal(await page.locator('#chatBody .user').last().textContent(), payload);
    assert.equal(await page.locator('#chatBody img').count(), 0);
    assert.equal(await page.evaluate(() => window.__xss), undefined);
    assert.match(await send('2 Classic with extra pearls, delivery'), /TOTAL: ₱230.00/);
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
    assert.match(await send('1 Classic, pickup'), /TOTAL: ₱75.00/);
    if (process.env.SMOKE_SCREENSHOT) await page.screenshot({ path: process.env.SMOKE_SCREENSHOT, fullPage: true });

    // Android Chrome mobile-web check: touch input, phone-sized viewport, and one-column demo.
    const android = await browser.newPage({ ...devices['Pixel 5'], reducedMotion: 'reduce' });
    await android.goto(base);
    assert.equal(await android.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No Android overflow');
    const phoneBox = await android.locator('.phone').boundingBox();
    const androidViewport = android.viewportSize();
    assert.ok(phoneBox.width <= androidViewport.width, 'Chat preview fits the Android viewport');
    assert.ok(phoneBox.x >= 0 && phoneBox.x + phoneBox.width <= androidViewport.width + 1, 'Chat preview is centered, not clipped');
    assert.equal(await android.locator('.demo-layout > *').count(), 1, 'Only the chat preview is in the demo layout');
    const chatHeight = await android.locator('#chatBody').evaluate(el => el.getBoundingClientRect().height);
    assert.ok(chatHeight >= 200, 'Chat log stays usable on a short Android screen');
    for (const selector of ['#navToggle', '#chatForm button', '#quickRow button']) {
      const size = await android.locator(selector).first().boundingBox();
      assert.ok(size.height >= 32 && size.width >= 32, `Tap target too small: ${selector}`);
    }
    await android.locator('#quickRow button').nth(2).tap();
    await android.waitForFunction(() => !document.querySelector('.typing'));
    assert.match(await android.locator('#chatBody .bot').last().innerText(), /Delivery is ₱50/);
    assert.equal(await android.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Chat replies keep Android width stable');
    if (process.env.ANDROID_SCREENSHOT) await android.screenshot({ path: process.env.ANDROID_SCREENSHOT, fullPage: true });
    await android.close();

    const broken = await browser.newPage();
    await broken.route('**/assets/chatbot-data.js', route => route.abort());
    await broken.goto(base);
    await broken.locator('#chatText').fill('menu');
    await broken.locator('#chatText').press('Enter');
    await broken.waitForFunction(() => !document.querySelector('.typing'));
    assert.match(await broken.locator('#chatBody .bot').last().innerText(), /scripts could not load/);

    const missingCalculator = await browser.newPage();
    await missingCalculator.route('**/assets/order-calculator.js', route => route.abort());
    await missingCalculator.goto(base);
    await missingCalculator.locator('#chatText').fill('menu');
    await missingCalculator.locator('#chatText').press('Enter');
    await missingCalculator.waitForFunction(() => !document.querySelector('.typing'));
    assert.match(await missingCalculator.locator('#chatBody .bot').last().innerText(), /Here’s our menu/);
    // Without the calculator module a typed order falls back to the scripted FAQ reply, never a guessed total.
    await missingCalculator.locator('#chatText').fill('2 Classic with extra pearls, delivery');
    await missingCalculator.locator('#chatText').press('Enter');
    await missingCalculator.waitForFunction(() => !document.querySelector('.typing'));
    const noMath = await missingCalculator.locator('#chatBody .bot').last().innerText();
    assert.doesNotMatch(noMath, /TOTAL: ₱/);
    assert.ok(noMath.length > 0);
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
    await local.locator('#chatText').fill('1 Classic, pickup');
    await local.locator('#chatText').press('Enter');
    await local.waitForFunction(() => !document.querySelector('.typing'));
    assert.match(await local.locator('#chatBody .bot').last().innerText(), /TOTAL: ₱75.00/);
    await offline.close();
    assert.deepEqual(errors, []);
    console.log('Browser smoke passed: project path, desktop/mobile/Android, quick replies, chat quotes, XSS, privacy, missing scripts, no-JS, and offline file usage.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
