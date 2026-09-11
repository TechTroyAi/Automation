/* Fictional shop pricing, in integer centavos. No payment or network integration. */
(function (root) {
  'use strict';
  const MENU = Object.freeze({
    classic: Object.freeze({ name: 'Classic Milk Tea', price: 7500 }),
    okinawa: Object.freeze({ name: 'Okinawa Milk Tea', price: 8500 }),
    wintermelon: Object.freeze({ name: 'Wintermelon Milk Tea', price: 8500 }),
    fruit: Object.freeze({ name: 'Fruit Tea', price: 7000 })
  });
  const PEARLS = 1500;
  const DELIVERY = 5000;
  const FREE_DELIVERY = 50000;
  const LIMITS = Object.freeze({ lines: 10, perLine: 20, drinks: 50 });
  const money = cents => `₱${(cents / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  function calculate(items, fulfillment) {
    if (!Array.isArray(items) || items.length < 1 || items.length > LIMITS.lines) throw new Error('Choose 1–10 drink lines.');
    if (!['pickup', 'delivery'].includes(fulfillment)) throw new Error('Choose pickup or delivery.');
    let drinks = 0;
    const lines = items.map(item => {
      if (!item || !Object.hasOwn(MENU, item.product)) throw new Error('Choose a drink from the menu.');
      if (!Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > LIMITS.perLine) throw new Error('Use a whole quantity from 1 to 20 per line.');
      if (!Number.isSafeInteger(item.pearls) || item.pearls < 0 || item.pearls > item.quantity) throw new Error('Pearl add-ons must be a whole number from 0 to the drink quantity (one serving per cup).');
      drinks += item.quantity;
      const drinkTotal = MENU[item.product].price * item.quantity;
      const pearlsTotal = PEARLS * item.pearls;
      return { ...item, name: MENU[item.product].name, drinkTotal, pearlsTotal, total: drinkTotal + pearlsTotal };
    });
    if (drinks > LIMITS.drinks) throw new Error('Please keep this sample quote to 50 drinks or fewer.');
    const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
    const delivery = fulfillment === 'delivery' && subtotal < FREE_DELIVERY ? DELIVERY : 0;
    return { lines, drinks, fulfillment, subtotal, delivery, total: subtotal + delivery };
  }

  function summary(quote) {
    const lines = quote.lines.map(line => line.pearls
      ? `${line.quantity} × ${line.name}: ${money(line.drinkTotal)} + ${line.pearls} extra pearl serving(s): ${money(line.pearlsTotal)} = ${money(line.total)}`
      : `${line.quantity} × ${line.name}: ${money(line.total)}`);
    lines.push(`Drinks + add-ons: ${money(quote.subtotal)}`);
    lines.push(quote.fulfillment === 'pickup' ? 'Pickup: ₱0.00' : `Delivery: ${money(quote.delivery)}${quote.delivery === 0 ? ' (free at ₱500.00+ before delivery)' : ''}`);
    lines.push(`TOTAL: ${money(quote.total)}`);
    return lines.join('\n');
  }

  // No payment fields, account numbers, links, or QR data live in this module: the demo
  // never renders a payable destination. "Show sample payment" was removed from the page.
  const GUIDE = 'Try a full order like “2 Classic with extra pearls, delivery” — say the drinks, the cups, and pickup or delivery.';
  const aliases = { classic: 'classic', okinawa: 'okinawa', wintermelon: 'wintermelon', 'winter melon': 'wintermelon', 'fruit tea': 'fruit' };

  // Chat filler ("bro", "po", "sakin", "nalang", "thanks") is stripped so a friendly order
  // still totals. Real modifiers such as "less ice" are never dropped — they get guidance.
  const LEADING_NOISE = /^(?:(?:uy|hoy|oi|bro|bruh|bro+|po|boss|sir|maam|madam|kuya|ate|pards|tol|no|ok|okay|sige|cge|ge|hi|hello|hey|please|pls|gusto ko|i want|want ko|palit ko|bili ako)\s+)+/;
  const NOISE = /\b(?:bro|bruh|bro+|po|pards|tol|ko|naman|sakin|sa akin)\b/g;
  const TRAILING_NOISE = /(?:\s+(?:bro|bruh|bro+|po|pards|tol|nalang|na lang|lang|thx|tnx|thanks|thank you|salamat|please|pls|na))+\s*$/;
  // "at" is Tagalog for "and", so it separates drink lines like a comma does.
  const SEPARATOR = /\s*(?:,|\+|\band\b|\bplus\b|\bat\b)\s*/;
  const MODE = /\s*(?:,\s*)?(?:(?:plus|and|for|at|\+)\s*)?\b(delivery|deliver|pickup|pick up)$/;
  const PICKUP = new Set(['pickup', 'pick up', 'pick up ko', 'takeout', 'take out', 'dine in', 'dinein']);
  const DELIVER = new Set(['delivery', 'deliver', 'deliver it', 'padala', 'ipadala', 'hatod']);

  // Deliberately small grammar: never silently ignore unknown products, quantities, or modifiers.
  // null means an ordinary FAQ. A recognized but incomplete order gets guidance, not a guess.
  function parse(text) {
    const raw = String(text ?? '').normalize('NFKC').toLowerCase().trim();
    if (!raw) return null;
    const input = raw.replace(LEADING_NOISE, '').replace(NOISE, ' ').replace(/\s+/g, ' ').trim();
    const prefix = /^(?:please\s+)?(?:calculate(?:\s+(?:a |the )?total(?:\s+for)?)?|quote(?:\s+for)?|total(?:\s+for)?|how much(?:\s+(?:is|for))?|can i order|order)\s+/;
    const startsWithItem = /^[+-]?\d+(?:\.\d+)?\s*(?:x\s*)?(?:classic|okinawa|winter\s?melon|fruit tea)\b/;
    const prefixed = prefix.test(input);
    const core = input.replace(prefix, '').replace(/\s+/g, ' ').trim();
    // Keep quantity-free FAQ questions such as "how much is classic" with the FAQ engine.
    if (!startsWithItem.test(core) && !(prefixed && /^[+-]?\d/.test(core)) && !/^(?:calculate|quote|total)(?:\s|$)/.test(input)) return null;
    if (raw.length > 200) return { error: 'Keep the order to 200 characters. ' + GUIDE };
    if (/\d{3,}/.test(core)) return { error: 'That’s more cups than this sample can total — 20 per line and 50 per order. ' + GUIDE };
    let body = core.replace(/[?!.,;]+$/, '').replace(TRAILING_NOISE, '').trim();
    const mode = body.match(MODE);
    const fulfillment = mode && (mode[1] === 'delivery' || mode[1] === 'deliver') ? 'delivery' : mode ? 'pickup' : null;
    if (mode) body = body.slice(0, mode.index).trim();
    const allPearls = /(?:,\s*|\s+)(?:with\s+)?extra pearls on (?:each|all)(?: drinks?)?$/;
    const pearlsForAll = allPearls.test(body);
    if (pearlsForAll) body = body.replace(allPearls, '').trim();
    const chunks = body.split(SEPARATOR);
    const items = [];
    for (const chunk of chunks) {
      const item = chunk.match(/^(\d{1,2})\s*(?:x\s*)?(classic(?: milk tea)?|okinawa(?: milk tea)?|winter\s?melon(?: milk tea)?|fruit tea)(\s+with (?:extra )?pearls)?$/);
      if (!item) return { error: 'I couldn’t read the whole order, so there’s no total yet. ' + GUIDE };
      // A global plus per-line topping request is ambiguous: do not double charge or silently deduplicate.
      if (pearlsForAll && item[3]) return { error: 'Choose either per-line pearls or “extra pearls on each”, not both. ' + GUIDE };
      const quantity = Number(item[1]);
      const product = aliases[item[2].replace(/ milk tea$/, '')];
      items.push({ product, quantity, pearls: pearlsForAll || item[3] ? quantity : 0 });
    }
    // Items are clear but the order is incomplete: ask for pickup or delivery instead of guessing.
    if (!fulfillment) return { needsFulfillment: true, items };
    try { return { quote: calculate(items, fulfillment) }; }
    catch (error) { return { error: error.message + ' ' + GUIDE }; }
  }

  const itemList = items => items.map(item => `${item.quantity} × ${MENU[item.product].name}`).join(' + ');
  const askFulfillment = items => `Got it: ${itemList(items)} 🧋 Pickup or delivery? Reply with one and I’ll total it.`;
  const quoteText = quote => `Here’s your sample quote! 🧋\n${summary(quote)}\nThis is a scripted estimate from sample prices, not a placed order or a real payment.`;
  const quote = (items, fulfillment) => quoteText(calculate(items, fulfillment));

  // “delivery” / “pickup” on its own completes an order the bot already read.
  function fulfillmentOf(text) {
    const clean = String(text ?? '').normalize('NFKC').toLowerCase()
      .replace(/[’'`]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').replace(/\s+/g, ' ').trim()
      .replace(NOISE, ' ').replace(LEADING_NOISE, '').replace(/\s+/g, ' ').trim();
    if (PICKUP.has(clean)) return 'pickup';
    return DELIVER.has(clean) ? 'delivery' : null;
  }

  function answer(text) {
    const result = parse(text);
    if (!result) return null;
    if (result.error) return result.error;
    if (result.needsFulfillment) return askFulfillment(result.items);
    return quoteText(result.quote);
  }
  const api = { MENU, PEARLS, DELIVERY, FREE_DELIVERY, LIMITS, money, calculate, summary, parse, answer, quote, quoteText, askFulfillment, fulfillmentOf };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ShopCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
