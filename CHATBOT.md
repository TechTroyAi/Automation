# Scripted chatbot: 1,040 questions, 52 topics

This is a **rule-based, fictional shop demo**, not a live AI, real shop, or connected
client deployment. It also answers questions about Troy's portfolio services.
There are **1,040 individually authored input phrases** (20 per topic), not 1,040
different answers. Related questions intentionally share one approved answer.
English, Tagalog, and Bisaya examples are included. Have a fluent speaker review
phrasing and have the business owner approve facts before using it for a client.

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
3. **Whole-word phrase match:** match authored inputs and keyword phrases inside
   the message. Longer phrases win over their generic components. Broad words
   like `price`, `order`, and `delivery` have reduced weight; greetings, thanks,
   and help have the lowest weight.
4. Equal-strength topics → ask the visitor to choose one, not an arbitrary reply.
5. No match → explain the limit and suggest known questions.

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
- Fictional prices/hours are labeled; no real home address, payment number,
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

This checks desktop/mobile layout, all quick replies, form submission, exact and
fallback responses, safe HTML display, missing scripts, local-file/offline usage,
and project-path asset loading. Do not commit `node_modules` or browser downloads.

On a Linux sandbox where the browser CDN is blocked, the same smoke test also
supports an npm-packaged browser (used for this PR's local browser verification):

```sh
npm install --no-save --package-lock=false playwright@1.63.0 @sparticuz/chromium@152.0.0
USE_PACKAGED_CHROMIUM=1 node tests/browser-smoke.cjs
```

These are optional test-only downloads, not website dependencies.
