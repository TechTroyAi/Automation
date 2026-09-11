'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const topics = require('../assets/chatbot-data.js');
const { createBot, normalize } = require('../assets/chatbot.js');
const bot = createBot(topics);

test('at least 1,000 unique authored inputs; every exact question returns its assigned answer', () => {
  assert.ok(bot.questionCount >= 1000);
  assert.equal(topics.length, 56);
  assert.equal(bot.questionCount, 1120);
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
  ['Location? 📍', 'location'], ['Order ko! 🧋', 'order'], ['Can I order?', 'order'],
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

test('order invitation is natural, exact, and does not repeat the demo notice', () => {
  assert.equal(bot.match('Can I order?').method, 'exact');
  assert.equal(bot.answer('Can I order?'), 'Of course! 🧋 Pick Classic, Okinawa, Wintermelon, or Fruit Tea. For a total, type it like “2 Classic with extra pearls, delivery”.');
  for (const input of ['menu', 'classic', 'okinawa', 'wintermelon', 'fruit tea', 'ice', 'hours', 'order', 'thanks']) {
    assert.doesNotMatch(bot.answer(input), /this demo|fictional|sample|scripted|no real order|do not enter/i, input);
  }
});

test('plain chat messages from real conversations get a scripted answer, not the fallback', () => {
  const cases = [
    ['whats your name?', 'bot_identity'], ['who made you??', 'bot_creator'],
    ['what are the flavors', 'fruit_flavors'], ['fruit Tea flavors bro what are in avail?', 'fruit_flavors'],
    ['can i buyy??', 'order'], ['can i buy', 'order'], ['ok', 'small_talk'], ['ok po', 'small_talk'],
    ['sige', 'small_talk'], ['bro, 1 fruit tea nalang', 'fruit']
  ];
  for (const [input, expected] of cases) assert.equal(bot.match(input).id, expected, input);
  // Short acknowledgements must never outrank the actual question in a longer message.
  assert.equal(bot.match('ok po, magkano ang delivery fee?').id, 'delivery_fee');
  assert.equal(bot.match('sige, how much is classic milk tea').id, 'classic');
  // The fallback and the clarification both stay short.
  assert.match(bot.match('brooooooooo').reply, /Could you rephrase that/);
  assert.match(bot.answer('hours and location'), /Which one would you like to start with/);
});

test('shop scripts never invent completed actions or request personal checkout details', () => {
  const shopTopics = topics.slice(0, topics.findIndex(topic => topic.id === 'services'));
  for (const topic of shopTopics) {
    assert.doesNotMatch(topic.reply, /order (?:is |has been )?(?:confirmed|saved|placed|cancelled|canceled)|payment (?:is |has been )?(?:received|processed)|staff (?:has|have) been notified|transferring you|refund (?:is |has been )?processed/i, topic.id);
  }
  assert.doesNotMatch(bot.answer('order'), /send.*(?:name|address|phone|payment)/i);
  assert.match(bot.answer('cancel'), /They’ll need to confirm/);
  assert.match(bot.answer('order status'), /don’t have an order status/);
  assert.match(bot.answer('human'), /You’ll need to send the message there/);
  assert.match(bot.answer('gcash'), /Never share your PIN or OTP/);
  assert.match(bot.answer('allergens'), /can’t guarantee/);
  assert.match(bot.answer('location'), /don’t have a verified address/);
  assert.match(bot.answer('testimonials'), /No client testimonials/);
  assert.match(bot.answer('privacy'), /does not send or save/);
  assert.match(bot.answer('help'), /scripted roleplay, not live AI/);
});
