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
  const PAYMENT = Object.freeze({ recipient: 'TechTroyAi — DEMO ONLY', reference: 'GCASH-TEST-000' });
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
    const lines = quote.lines.map(line => `${line.quantity} × ${line.name}: ${money(line.drinkTotal)}${line.pearls ? ` + ${line.pearls} extra pearl serving(s): ${money(line.pearlsTotal)}` : ''} = ${money(line.total)}`);
    lines.push(`Drinks + add-ons: ${money(quote.subtotal)}`);
    lines.push(quote.fulfillment === 'pickup' ? 'Pickup: ₱0.00' : `Delivery: ${money(quote.delivery)}${quote.delivery === 0 ? ' (free at ₱500.00+ before delivery)' : ''}`);
    lines.push(`TOTAL: ${money(quote.total)}`);
    return lines.join('\n');
  }

  function paymentPreview(quote) {
    return `SAMPLE PAYMENT — DO NOT SEND MONEY\nRecipient: ${PAYMENT.recipient}\nPlaceholder ID: ${PAYMENT.reference}\nSample amount: ${money(quote.total)}\nThis is not a GCash account, phone number, QR code, or payment link. No payment or order will be processed.`;
  }

  const GUIDE = 'For a total, try “2 Classic with extra pearls, delivery” or “1 Okinawa and 2 Fruit Tea, pickup”. Use digits and say pickup or delivery. Add “with extra pearls” to a drink line, or “extra pearls on each” for all drinks. For anything else, use the quote form below.';
  const aliases = { classic: 'classic', okinawa: 'okinawa', wintermelon: 'wintermelon', 'winter melon': 'wintermelon', 'fruit tea': 'fruit' };
  // Deliberately small grammar: never silently ignore unknown products, quantities, or modifiers.
  // null means an ordinary FAQ. A recognized but invalid quote returns an error without a total.
  function parse(text) {
    const input = String(text ?? '').normalize('NFKC').toLowerCase().trim();
    const prefix = /^(?:please\s+)?(?:calculate(?:\s+(?:a |the )?total(?:\s+for)?)?|quote(?:\s+for)?|total(?:\s+for)?|how much(?:\s+(?:is|for))?|can i order|order)\s+/;
    const startsWithItem = /^[+-]?\d+(?:\.\d+)?\s*(?:x\s*)?(?:classic|okinawa|winter\s?melon|fruit tea)\b/;
    const prefixed = prefix.test(input);
    // Keep quantity-free FAQ questions such as "how much is classic" with the FAQ engine.
    if (!startsWithItem.test(input) && !(prefixed && /^[+-]?\d/.test(input.replace(prefix, ''))) && !/^(?:calculate|quote|total)(?:\s|$)/.test(input)) return null;
    if (input.length > 200) return { error: 'Keep the quote to 200 characters. ' + GUIDE };
    let body = input.replace(prefix, '').replace(/[?!.]+$/, '').replace(/\s+/g, ' ').trim();
    const mode = body.match(/\s*(?:,\s*)?(?:(?:plus|and|for|\+)\s*)?\b(delivery|pickup|pick up)$/);
    if (!mode) return { error: GUIDE };
    const fulfillment = mode[1] === 'delivery' ? 'delivery' : 'pickup';
    body = body.slice(0, mode.index).trim();
    const allPearls = /(?:,\s*|\s+)(?:with\s+)?extra pearls on (?:each|all)(?: drinks?)?$/;
    const pearlsForAll = allPearls.test(body);
    if (pearlsForAll) body = body.replace(allPearls, '').trim();
    const chunks = body.split(/\s*(?:,|\+|\band\b|\bplus\b)\s*/);
    const items = [];
    for (const chunk of chunks) {
      const item = chunk.match(/^(\d{1,2})\s*(?:x\s*)?(classic(?: milk tea)?|okinawa(?: milk tea)?|winter\s?melon(?: milk tea)?|fruit tea)(\s+with (?:extra )?pearls)?$/);
      if (!item) return { error: 'I couldn’t read the whole quote, so I haven’t calculated a total. ' + GUIDE };
      // A global plus per-line topping request is ambiguous: do not double charge or silently deduplicate.
      if (pearlsForAll && item[3]) return { error: 'Please choose either per-line pearls or “extra pearls on each”, not both. ' + GUIDE };
      const quantity = Number(item[1]);
      const product = aliases[item[2].replace(/ milk tea$/, '')];
      items.push({ product, quantity, pearls: pearlsForAll || item[3] ? quantity : 0 });
    }
    try { return { quote: calculate(items, fulfillment) }; }
    catch (error) { return { error: error.message + ' ' + GUIDE }; }
  }

  function answer(text) {
    const result = parse(text);
    if (!result) return null;
    if (result.error) return result.error;
    return `Here’s your sample quote! 🧋\n${summary(result.quote)}\nThis quote is separate from the form. For a sample payment summary, use the calculator’s “Show sample payment” button.`;
  }
  const api = { MENU, PEARLS, DELIVERY, FREE_DELIVERY, LIMITS, PAYMENT, money, calculate, summary, paymentPreview, parse, answer };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ShopCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
