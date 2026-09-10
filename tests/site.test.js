'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');

test('generated library is synchronized with its editable source', () => {
  execFileSync(process.execPath, ['scripts/build-chatbot.js', '--check'], { cwd: root });
});

test('browser scripts load in dependency order with no CommonJS environment', () => {
  const context = vm.createContext({});
  vm.runInContext(read('assets/chatbot-data.js'), context);
  vm.runInContext(read('assets/chatbot.js'), context);
  assert.equal(vm.runInContext('ScriptedChatbot.createBot(CHATBOT_TOPICS).match("cancel my order please").id', context), 'cancel');
  assert.ok(html.indexOf('src="assets/chatbot-data.js"') < html.indexOf('src="assets/chatbot.js"'));
});

test('local script assets exist and Pages copies them to the project site', () => {
  const sources = [...html.matchAll(/<script src="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(sources, ['assets/chatbot-data.js', 'assets/chatbot.js', 'assets/order-calculator.js', 'assets/order-ui.js']);
  for (const src of sources) assert.ok(fs.existsSync(path.join(root, src)));
  assert.match(read('.github/workflows/pages.yml'), /cp -R assets _site\/assets/);
  assert.match(read('.github/workflows/pages.yml'), /node --test tests\/\*\.test\.js/);
});

test('honest proof and owner-published contact details in the published page', () => {
  assert.doesNotMatch(html, /Demo video coming here|VIDEO_ID|Real demos, not promises|Most popular|Zero risk/);
  assert.doesNotMatch(html, /17-year-old|Tubod|Lanao del Norte|Troy Candia/);
  assert.match(html, /mailto:josiahcandia@gmail\.com/);
  assert.match(html, /https:\/\/www\.facebook\.com\/share\/1B2Db5JcdP\//);
  assert.match(html, /not a client deployment/);
  assert.match(html, /No client testimonials are published yet/);
  assert.match(html, /first <b>1–2 pilot clients/);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.deepEqual(schema.address, { '@type': 'PostalAddress', addressCountry: 'PH' });
});

test('visible library counts match the actual data', () => {
  const topics = require('../assets/chatbot-data.js');
  const count = topics.reduce((sum, topic) => sum + topic.questions.length, 0);
  assert.match(html, new RegExp(`${count.toLocaleString('en-US')} scripted questions across ${topics.length} topics`));
});

test('all internal navigation links have a target and IDs are unique', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(target), target);
});

test('UI uses textContent, limits input, and documents failure/privacy behavior', () => {
  const ui = html.slice(html.lastIndexOf('<script>'));
  assert.doesNotMatch(ui, /innerHTML|insertAdjacentHTML|document\.write|eval\(/);
  assert.match(ui, /div\.textContent = text/);
  assert.match(ui, /slice\(0, 200\)/);
  assert.match(ui, /scripts could not load/);
  assert.match(html, /<noscript>/);
  assert.match(html, /aria-describedby="demoPrivacy"/);
  assert.match(html, /Messages stay in page memory/);
  assert.match(html, /id="demoPrivacy">Demo only—no real orders, payments, or staff handoffs/);
  assert.match(html, /Use made-up details, never personal or payment information/);
  assert.doesNotMatch(ui + read('assets/chatbot.js') + read('assets/order-calculator.js') + read('assets/order-ui.js'), /fetch\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon/);
  new vm.Script(ui.replace('<script>', '').split('</script>')[0]);
});
