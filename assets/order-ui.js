/* Accessible, local-only quote form. No personal-info fields or payment processing. */
(function () {
  'use strict';
  const form = document.getElementById('quoteForm');
  if (!form) return;
  const controls = document.getElementById('quoteControls');
  const items = document.getElementById('quoteItems');
  const add = document.getElementById('quoteAdd');
  const payment = document.getElementById('quotePayment');
  const paymentText = document.getElementById('quotePaymentText');
  const result = document.getElementById('quoteResult');
  const fulfillment = document.getElementById('quoteFulfillment');
  const calculator = window.ShopCalculator;
  if (!calculator) {
    controls.disabled = true;
    result.textContent = 'The calculator could not load. Please refresh; the FAQ demo can still answer questions.';
    return;
  }
  let currentQuote = null;
  let sequence = 0;
  const hint = 'Choose your drinks, then calculate. This is a local quote, not a placed order.';
  function invalidate() {
    currentQuote = null;
    payment.disabled = true;
    paymentText.hidden = true;
    paymentText.textContent = '';
    result.textContent = hint;
  }
  function updateButtons() {
    add.disabled = items.children.length >= calculator.LIMITS.lines;
    items.querySelectorAll('.quote-remove').forEach(button => { button.disabled = items.children.length <= 1; });
  }
  function field(container, label, element) {
    const wrapper = document.createElement('label');
    const text = document.createElement('span');
    text.textContent = label;
    wrapper.append(text, element);
    container.appendChild(wrapper);
    return element;
  }
  function addLine(focus) {
    if (items.children.length >= calculator.LIMITS.lines) return;
    const row = document.createElement('fieldset');
    row.className = 'quote-line';
    const legend = document.createElement('legend');
    legend.textContent = `Drink line ${++sequence}`;
    row.appendChild(legend);
    const product = document.createElement('select');
    product.name = 'product';
    for (const [id, entry] of Object.entries(calculator.MENU)) {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = `${entry.name} — ${calculator.money(entry.price)}`;
      product.appendChild(option);
    }
    field(row, 'Drink', product);
    const counts = document.createElement('div');
    counts.className = 'quote-counts';
    for (const [name, label, initial, min] of [['quantity', 'Cups (1–20)', '1', '1'], ['pearls', 'Cups with extra pearls', '0', '0']]) {
      const input = document.createElement('input');
      input.type = 'number'; input.name = name; input.value = initial;
      input.min = min; input.max = '20'; input.step = '1'; input.required = true;
      field(counts, label, input);
    }
    row.appendChild(counts);
    const remove = document.createElement('button');
    remove.type = 'button'; remove.className = 'quote-remove';
    remove.textContent = 'Remove line';
    remove.setAttribute('aria-label', `Remove drink line ${sequence}`);
    remove.addEventListener('click', () => {
      row.remove(); invalidate(); updateButtons(); add.focus();
    });
    row.appendChild(remove);
    items.appendChild(row);
    invalidate(); updateButtons();
    if (focus) product.focus();
  }
  add.addEventListener('click', () => addLine(true));
  form.addEventListener('input', invalidate);
  form.addEventListener('change', invalidate);
  form.addEventListener('submit', event => {
    event.preventDefault();
    invalidate();
    try {
      const lines = [...items.children].map(row => ({
        product: row.querySelector('[name="product"]').value,
        quantity: row.querySelector('[name="quantity"]').valueAsNumber,
        pearls: row.querySelector('[name="pearls"]').valueAsNumber
      }));
      currentQuote = calculator.calculate(lines, fulfillment.value);
      result.textContent = calculator.summary(currentQuote);
      payment.disabled = false;
    } catch (error) {
      result.textContent = error.message;
    }
  });
  payment.addEventListener('click', () => {
    if (!currentQuote) return;
    paymentText.textContent = calculator.paymentPreview(currentQuote);
    paymentText.hidden = false;
  });
  document.getElementById('quoteClear').addEventListener('click', () => {
    items.replaceChildren(); sequence = 0; fulfillment.value = 'pickup';
    addLine(true);
  });
  addLine(false);
})();
