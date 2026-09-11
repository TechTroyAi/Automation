'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const c = require('../assets/order-calculator');
const item = (product, quantity, pearls = 0) => ({ product, quantity, pearls });

test('two Classic with pearls on each plus delivery is exactly ₱230', () => {
  const q = c.calculate([item('classic', 2, 2)], 'delivery');
  assert.equal(q.subtotal, 18000);
  assert.equal(q.delivery, 5000);
  assert.equal(q.total, 23000);
  assert.match(c.summary(q), /TOTAL: ₱230\.00/);
});

test('each menu price, mixed items, and per-cup add-ons', () => {
  for (const [id, price] of [['classic', 7500], ['okinawa', 8500], ['wintermelon', 8500], ['fruit', 7000]]) {
    assert.equal(c.calculate([item(id, 1)], 'pickup').total, price);
  }
  const q = c.calculate([item('classic', 2, 1), item('okinawa', 1), item('fruit', 1)], 'pickup');
  assert.equal(q.drinks, 4);
  assert.equal(q.lines[0].pearlsTotal, 1500);
  assert.equal(q.total, 32000);
  assert.equal(q.delivery, 0);
});

test('free delivery threshold is inclusive and uses drinks plus add-ons before delivery', () => {
  // ₱490 → ₱540; adding the fee must not retroactively qualify for free delivery.
  assert.equal(c.calculate([item('fruit', 7)], 'delivery').total, 54000);
  // ₱500 exactly: 5 Okinawa (₱425) + 1 Classic (₱75).
  const exact = c.calculate([item('okinawa', 5), item('classic', 1)], 'delivery');
  assert.equal(exact.subtotal, 50000);
  assert.equal(exact.delivery, 0);
  assert.equal(c.calculate([item('fruit', 7, 1)], 'delivery').total, 50500);
  assert.equal(c.calculate([item('classic', 20, 20)], 'delivery').total, 180000);
});

test('rejects invalid quantities, add-ons, unknown items and fulfillment', () => {
  for (const value of [0, -1, 1.5, NaN, Infinity, '2', null, 21, Number.MAX_SAFE_INTEGER]) {
    assert.throws(() => c.calculate([item('classic', value)], 'pickup'), /quantity/);
  }
  for (const value of [-1, 3, 0.5, NaN, Infinity, '1', undefined]) {
    const line = { product: 'classic', quantity: 2, pearls: value };
    assert.throws(() => c.calculate([line], 'pickup'), /Pearl add-ons/);
  }
  for (const product of ['taro', '__proto__', 'constructor', null]) {
    assert.throws(() => c.calculate([item(product, 1)], 'pickup'), /menu/);
  }
  assert.throws(() => c.calculate([], 'pickup'), /drink lines/);
  assert.throws(() => c.calculate([item('classic', 1)], 'ship'), /pickup or delivery/);
  assert.throws(() => c.calculate(Array(11).fill(item('classic', 1)), 'pickup'), /drink lines/);
  assert.throws(() => c.calculate(Array(3).fill(item('classic', 20)), 'pickup'), /50 drinks/);
  assert.equal(c.calculate([item('classic', 20), item('fruit', 20), item('okinawa', 10)], 'pickup').drinks, 50);
});

test('pricing is authoritative, immutable and does not mutate callers', () => {
  const input = Object.freeze([Object.freeze({ ...item('classic', 1), price: 1, total: 1 })]);
  assert.equal(c.calculate(input, 'pickup').total, 7500);
  assert.throws(() => { c.MENU.classic.price = 1; }, TypeError);
});

const examples = [
  ['2 Classic with extra pearls on each, plus delivery?', 23000],
  ['2 Classic with extra pearls, delivery', 23000],
  ['1 Okinawa and 2 Fruit Tea, pickup', 22500],
  ['Calculate 2x Classic milk tea + 1 winter melon, pickup!', 23500],
  ['how much for 2 classic with pearls and 1 fruit tea, delivery?', 30000],
  ['2 Classic and 1 Okinawa with extra pearls on each, delivery', 33000],
  ['５ Okinawa and １ Classic, delivery', 50000],
  ['quote 1 fruit tea, pick up', 7000]
];
for (const [text, total] of examples) {
  test(`parses complete quote: ${text}`, () => assert.equal(c.parse(text).quote.total, total));
}

test('ordinary FAQs do not get intercepted by the calculator', () => {
  const topics = require('../assets/chatbot-data');
  for (const topic of topics) for (const text of topic.questions) assert.equal(c.parse(text), null, text);
  for (const text of ['Can I order?', 'How much is Classic?', 'delivery fee', 'my phone number is private', '<img src=x onerror=alert(1)>']) assert.equal(c.parse(text), null);
});

test('unknown products, modifiers and partial orders never produce a misleading total', () => {
  for (const text of ['2 classic and 1 taro, delivery', '-2 classic, pickup', '2.5 classic, pickup',
    '0 classic, pickup', '21 classic, pickup', '2 classic, no delivery',
    '2 classic, pickup and delivery', '2 classic, free delivery', '2 classic without pearls, delivery',
    '2 classic with pearls and 1 fruit tea with extra pearls on each, pickup',
    '2 classic with extra pearls on one, delivery', '2 classic less ice, pickup',
    '2 classic cancel my order, pickup', 'total', 'calculate ' + 'x'.repeat(210),
    '2 classic and, delivery', 'calculate 1 taro, pickup']) {
    const result = c.parse(text);
    assert.ok(result && result.error, text);
    assert.equal(result.quote, undefined, text);
    assert.doesNotMatch(c.answer(text), /TOTAL: ₱/, text);
  }
});

test('friendly chat phrasing totals too: filler words, “at” as and, and a pickup/delivery follow-up', () => {
  // Tagalog “at” means “and”, and chat filler (“bro”, “sakin”, “nalang”, “thx”) is ignored.
  for (const text of ['3 Wintermelon bro at 5 Fruit Tea sakin thx', 'no 3 wintermelon and 5 Fruit Tea', 'bro 1 fruit tea nalang', '2 classic']) {
    const result = c.parse(text);
    assert.equal(result.needsFulfillment, true, text);
    assert.equal(result.error, undefined, text);
    assert.match(c.askFulfillment(result.items), /Pickup or delivery/);
  }
  const items = c.parse('3 wintermelon at 5 fruit tea').items;
  assert.deepEqual(items.map(item => [item.product, item.quantity]), [['wintermelon', 3], ['fruit', 5]]);
  // The bot asks for one word, then finishes the same order (₱605 clears free delivery).
  assert.equal(c.fulfillmentOf('delivery'), 'delivery');
  assert.equal(c.fulfillmentOf('hatod'), 'delivery');
  assert.equal(c.fulfillmentOf('pick up'), 'pickup');
  assert.equal(c.fulfillmentOf('delivery fee?'), null);
  assert.match(c.quote(items, c.fulfillmentOf('delivery')), /TOTAL: ₱605\.00/);
  assert.match(c.quote(items, 'pickup'), /Pickup: ₱0\.00/);
});

test('impossible amounts get a limit message instead of a total', () => {
  const result = c.parse('bro 1000000 fruit tea saa kinn');
  assert.ok(result.error);
  assert.match(result.error, /20 per line and 50 per order/);
  assert.doesNotMatch(c.answer('bro 1000000 fruit tea saa kinn'), /TOTAL: ₱/);
});

test('no payment destination can be produced by the chat calculator', () => {
  // The page has no checkout UI, so the module exposes no payment preview at all.
  assert.equal(c.paymentPreview, undefined);
  assert.equal(c.PAYMENT, undefined);
  const answer = c.answer('2 classic with pearls, delivery');
  for (const text of [c.summary(c.calculate([item('classic', 2, 2)], 'delivery')), answer]) {
    assert.doesNotMatch(text, /(?:\+?63|09)\d{9,10}|https?:\/\/|gcash|maya|show sample payment/i, text);
  }
  assert.match(answer, /TOTAL: ₱230\.00/);
  assert.match(answer, /not a placed order or a real payment/);
});

test('calculator runs offline in the browser global environment', () => {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(require.resolve('../assets/order-calculator'), 'utf8'), context);
  assert.equal(vm.runInContext('ShopCalculator.parse("2 classic with pearls, delivery").quote.total', context), 23000);
});
