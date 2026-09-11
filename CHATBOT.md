# Scripted chatbot: 1,040 questions, 52 topics

This is a **rule-based, fictional shop demo**, not a live AI, real shop, or connected
client deployment. It also answers questions about Troy's portfolio services.
There are **1,040 individually authored input phrases** (20 per topic), not 1,040
different answers. Related questions intentionally share one approved answer.
English, Tagalog, and Bisaya examples are included. Have a fluent speaker review
phrasing and have the business owner approve facts before using it for a client.

## Customer-service tone

Shop replies now speak in character, rather than repeating “this is a demo” in
every bubble. For example, **“Can I order?”** has this exact scripted reply:

> Of course! 🧋 What would you like? Choose Classic, Okinawa, Wintermelon, or Fruit
> Tea. For a total, type a complete order with pickup or delivery, like “2 Classic
> with extra pearls, delivery”.

The persistent notice below the input labels the roleplay, states that no real
orders/payments/staff handoffs occur, and asks visitors to use made-up details.
The input references it with `aria-describedby`. `help` and `privacy` still explain
the actual limits when asked. Allergy, payment-security, and unavailable-data
answers keep relevant cautions without a repetitive demo disclaimer.

**This is not a checkout implementation.** The chat totals sample drinks and
add-ons, but it does not reserve stock, save a real order, or process payment.
Cancellation, status, refunds, and human assistance still direct visitors to the
appropriate contact instead of claiming a real-world action succeeded.

## Sample price calculator (chat only)

The demo section shows **only the milk tea chat**. There is no quote form, no
“Try the math” card, and no sample-payment preview: typed orders are totalled by
the bot itself, so one interface covers both FAQ answers and pricing.

`assets/order-calculator.js` is a pure module used by the chat script. Prices are
integer **centavos**: Classic 7500, Okinawa/Wintermelon 8500, Fruit Tea 7000; an
extra pearl serving is 1500. Edit `MENU`, `PEARLS`, `DELIVERY`, and
`FREE_DELIVERY` there, and update the corresponding FAQ replies and visible copy
when changing prices. Regenerate `assets/chatbot-data.js` after FAQ edits.

- Limits per typed order: up to **10 lines**, **1–20 cups per line**, **50 cups total**.
- `with extra pearls` applies one extra serving to every cup on its drink line;
  `extra pearls on each` applies to all drinks. No double toppings, discounts, or
  taxes are included in this sample pricing model.
- Pickup is ₱0. Delivery is ₱50 unless **drinks + add-ons before delivery ≥ ₱500**.
- Every quote is computed fresh and remembered nowhere: no form state, no
  local/session storage, and no server. Refresh clears the whole chat.
- Chat quotes are stateless estimates; they do **not** place, hold, or modify an order.

Supported chat examples (digits required; always specify pickup or delivery):

| Input | Total |
|---|---|
| `2 Classic with extra pearls on each, plus delivery?` | ₱230.00 |
| `2 Classic with extra pearls, delivery` | ₱230.00 |
| `1 Okinawa and 2 Fruit Tea, pickup` | ₱225.00 |
| `5 Okinawa and 1 Classic, delivery` | ₱500.00 (free delivery) |

Separate items with commas, `and`, `plus`, or `+`. `with extra pearls` applies to
every cup on its own line; a final `extra pearls on each` applies to all drinks.
Don't combine both styles in one quote. `2x Classic` and full-width digits also
work. Optional prefixes include `calculate`, `quote`, `total for`, and `how much
for`. This is **not free-form AI parsing**: unknown products, unspecified
fulfillment, decimals, negatives, excessive quantities, or unsupported modifiers
(such as `less ice`) produce guidance, never a guessed partial total. Sugar/ice
FAQs remain available, but those choices are not stored in a quote.

### No payment destination exists anywhere in the demo

The demo deliberately ships **no** recipient name, account number, phone number,
QR code, payment link, or paid/confirmed state — not even an obviously fake test
one. A real checkout requires a separately scoped, authorized payment integration
with server-side verification. Keep it that way: never substitute a plausible
number, because it could belong to someone.

## Where are the actual scripted lines?

[`scripts/chatbot-topics.txt`](scripts/chatbot-topics.txt) contains **all 1,040 inputs**,
keywords, and responses in an editable format. Each topic is four lines:

1. Unique `id | Human-readable topic name`
2. Semicolon-separated keyword phrases
3. One plain-text response (no HTML)
4. Semicolon-separated scripted inputs

Blank lines separate topics; lines beginning with `#` are comments. Inputs must be
unique after normalization. Do not put semicolons inside a single input or key.
Keep replies factual and use explicit limitations for unavailable data/actions.

After editing, run:

```sh
node scripts/build-chatbot.js
node scripts/build-chatbot.js --check
node --test tests/*.test.js
```

Commit both the source and generated `assets/chatbot-data.js`. The deployed site
uses ordinary local scripts, not `fetch`, a bundler, or an API, so opening
`index.html` directly still works offline as long as `assets/` is beside it.
Node 22 is used only for authoring/testing; visitors do not need it.

## Matching order (no random replies)

1. Normalize Unicode width, case, apostrophes, punctuation, emoji, and whitespace.
2. **Exact normalized input:** return its assigned topic immediately.
3. **Sample quote syntax (chat):** for non-exact FAQ inputs, try the calculator.
   A complete quote returns a total; a recognized but invalid quote returns
   guidance. Other text falls through to the FAQ matcher.
4. **Whole-word phrase match:** match authored inputs and keyword phrases inside
   the message. Longer phrases win over their generic components. Broad words
   like `price`, `order`, and `delivery` have reduced weight; greetings, thanks,
   and help have the lowest weight.
5. Equal-strength topics → ask the visitor to choose one, not an arbitrary reply.
6. No match → explain the limit and suggest known questions.

There is no fuzzy spelling correction or semantic understanding. Ask one topic
at a time. An exact question can intentionally override a broad word: `what is
your email` means portfolio contact, not a drink order. Matching a longer phrase
can select just one topic in a multi-topic message; this is not a conversational
AI. Add a specific input or phrase when a common wording is missed rather than
adding huge ambiguous keyword lists.

| Try this | Assigned response |
|---|---|
| `Tagpila? 💰` | Sample shop menu |
| `Hi, how much is delivery?` | Delivery fee, not drink prices |
| `Please cancel this order` | Cancellation limitation, not order intake |
| `Hello, chatbot pricing please` | Service packages, not milk tea prices |
| `Classic milk tea price` | Classic-specific sample price |
| `Where is my rider?` | Delivery tracking limitation, not shop address |
| `Do you need my OTP?` | Privacy warning |
| `Hours and location` | Clarification |
| `This is a spaceship` | Fallback, not `hi` or `ship` |

## Topic coverage

- **Shop:** menu; Classic, Okinawa, Wintermelon, fruit tea; pearls; sugar; ice;
  sizes; allergens; nutrition; hours; location; delivery fee, time, and coverage;
  pickup/dine-in; sample order flow; order status; cancellation; order changes;
  payments; refunds; promotions; bulk orders; human contact; privacy; greetings;
  thanks/goodbye; bot help.
- **Portfolio:** services; chatbot, automation, and editing prices; turnaround;
  service payment terms; pilot builds; proof/testimonials; contact; onboarding;
  platforms; integrations; custom AI tools; languages; ongoing costs;
  revisions/support; account ownership; client-data safety; remote work;
  honest expectations; editing scope; outreach.

## Safety and deployment

- Visitor messages **and all new replies** use `textContent`, never `innerHTML`.
- No network requests, local/session storage, orders, payments, or staff alerts
  are made by the demo code. Messages live in the current page's DOM/memory and
  clear on refresh. Hosting and external links have their own data practices.
- The interface labels the fictional shop and its sample facts; no real home address, payment number,
  allergen guarantee, live stock, or delivery estimate is fabricated.
- The UI explains missing-script failures and has a no-JavaScript message.
- The Pages workflow checks the generated file, runs tests, and deploys `assets/`
  alongside the HTML using relative paths suitable for `/Automation/`.

## Browser smoke test (optional developer tooling)

The Node test suite is dependency-free. To also run Chromium integration checks:

```sh
npm install --no-save --package-lock=false playwright@1.63.0
npx playwright install chromium
node tests/browser-smoke.cjs
```

This checks desktop, mobile, and **Android Chrome emulation** (Pixel-class
viewport, tap-sized controls, no horizontal overflow), all quick replies, chat
quotes, exact and fallback responses, safe HTML display, missing scripts,
local-file/offline usage, and project-path asset loading. Calculator tests cover
mixed drinks, free delivery, invalid inputs, and that no payment destination can
be produced. Do not commit `node_modules` or browser downloads.

On a Linux sandbox where the browser CDN is blocked, the same smoke test also
supports an npm-packaged browser (used for this PR's local browser verification):

```sh
npm install --no-save --package-lock=false playwright@1.63.0 @sparticuz/chromium@152.0.0
USE_PACKAGED_CHROMIUM=1 node tests/browser-smoke.cjs
```

These are optional test-only downloads, not website dependencies.
