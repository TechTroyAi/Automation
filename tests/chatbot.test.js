'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const topics = require('../assets/chatbot-data.js');
const { createBot, normalize } = require('../assets/chatbot.js');
const bot = createBot(topics);

test('at least 1,000 unique authored inputs; every exact question returns its assigned answer', () => {
  assert.ok(bot.questionCount >= 1000);
  assert.equal(topics.length, 52);
  assert.equal(bot.questionCount, 1040);
  for (const topic of topics) {
    assert.equal(topic.questions.length, 20);
    assert.ok(topic.keys.length);
    for (const question of topic.questions) {
      const result = bot.match(question);
      assert.equal(result.id, topic.id, question);
      assert.equal(result.reply, topic.reply, question);
      assert.equal(result.method, 'exact', question);
      // Case, punctuation, emoji, and whitespace must not change any exact mapping.
      assert.equal(bot.match(`  ${question.toUpperCase().replaceAll(' ', '   ')}?! 🧋 `).id, topic.id, question);
    }
  }
});

test('normalizes apostrophes, Unicode width, punctuation and whitespace', () => {
  assert.equal(normalize('  ＨＩ!  What’s\nTHIS? 🧋'), 'hi whats this');
  assert.equal(normalize(null), '');
});

const cases = [
  ['Tagpila? 💰', 'menu'], ['Open mo? 🕐', 'hours'],
  ['Location? 📍', 'location'], ['Order ko! 🧋', 'order'],
  ['Hi, how much is delivery?', 'delivery_fee'],
  ['How much is chatbot pricing?', 'chatbot_pricing'],
  ['Hello, chatbot pricing please', 'chatbot_pricing'],
  ['Please cancel this order', 'cancel'],
  ['How do I cancel my order?', 'cancel'],
  ['Hi please cancel my order', 'cancel'],
  ['Hello shipping fee please', 'delivery_fee'],
  ['How much for wintermelon?', 'wintermelon'],
  ['Hi classic milk tea price please', 'classic'],
  ['Where is my rider?', 'delivery_time'],
  ['Where is my order confirmation?', 'order_status'],
  ['How much is video editing?', 'video_pricing'],
  ['How much is an automation?', 'automation_pricing'],
  ['May free delivery ba?', 'delivery_fee'],
  ['Pila bayad sa hatod?', 'delivery_fee'],
  ['Do you need my OTP?', 'privacy'],
  ['Can I cancel my order please?', 'cancel'],
  ['Thanks, what are your opening hours?', 'hours'],
];
for (const [input, expected] of cases) {
  test(`specific reply: ${input}`, () => assert.equal(bot.match(input).id, expected));
}

test('never matches keywords inside unrelated words', () => {
  for (const input of ['this', 'spaceship', 'paymentology', 'iceberg', 'showcase', 'orderly', 'humanity', 'cancellationish']) {
    assert.equal(bot.match(input).method, 'fallback', input);
  }
});

test('unknown, empty, emoji-only, and unrelated messages do not guess', () => {
  for (const input of ['', '   ', '🦊', 'tell me a dinosaur joke', 'weather tomorrow', '<img src=x onerror=alert(1)>']) {
    assert.equal(bot.match(input).method, 'fallback', input);
  }
});

test('equally specific questions ask for clarification, independent of rule order', () => {
  const reversed = createBot([...topics].reverse());
  for (const input of ['hours and location', 'sugar and ice', 'delivery fee and chatbot pricing']) {
    assert.equal(bot.match(input).method, 'clarify', input);
    assert.equal(reversed.match(input).method, 'clarify', input);
  }
  for (const [input, expected] of cases) assert.equal(reversed.match(input).id, expected, input);
});

test('rejects normalized duplicates and duplicate topic IDs at authoring time', () => {
  assert.throws(() => createBot([{ ...topics[0], questions: ['Hello', ' HELLO! '] }]), /Duplicate/);
  assert.throws(() => createBot([topics[0], topics[0]]), /duplicate topic/);
});

test('sensitive actions have honest demo limitations', () => {
  assert.match(bot.answer('order'), /does not calculate a checkout, save an order/);
  assert.match(bot.answer('human'), /no staff member has been notified/);
  assert.match(bot.answer('gcash'), /No payments are accepted/);
  assert.match(bot.answer('allergens'), /cannot verify allergens/);
  assert.match(bot.answer('location'), /no real shop address/);
  assert.match(bot.answer('testimonials'), /No client testimonials/);
  assert.match(bot.answer('privacy'), /does not send or save/);
});
