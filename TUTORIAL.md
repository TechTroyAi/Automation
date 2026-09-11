# 📖 How Your Portfolio Works — The Full Tutorial

> Read this top to bottom once (15–20 mins). After that you'll actually understand
> your own website — and that's what separates you from people who just copy-paste.

---

## Part 0: The Big Picture (read this first 🧠)

A website is just **a file your browser reads and displays**. That's literally it.

Your portfolio starts at **`index.html`**, with local chatbot scripts (including a
sample price calculator) in `assets/`. Together they use three languages:

| Language | Job | Analogy |
|---|---|---|
| **HTML** | Structure — *what* is on the page (headings, text, buttons, images) | The skeleton 🦴 |
| **CSS** | Design — *how* it looks (colors, sizes, spacing) | The clothes 👕 |
| **JavaScript (JS)** | Behavior — *what happens* (animations, year auto-update) | The brain 🧠 |

The layout and styles stay together; chatbot data and matching have their own
files so the growing question library stays maintainable. You can:
- Open it offline (keep `assets/` beside `index.html`)
- Host it free in 5 minutes (Part 5)
- Learn the page layout in `index.html` and chatbot behavior in `CHATBOT.md`

**Where each lives in `index.html`:**
- HTML → everywhere (the `<h1>`, `<p>`, `<div>` tags)
- CSS → inside the `<style>...</style>` block in `<head>`
- JS → local `assets/` scripts plus the UI `<script>` at the bottom

Open `index.html` right now and find those 3 areas. I'll wait. 👀

---

## Part 1: HTML — The Skeleton 🦴 (5 mins)

HTML is made of **tags**. A tag looks like this:

```html
<h1>This is a big heading</h1>
<p>This is a paragraph of text.</p>
<a href="https://facebook.com">This is a link</a>
```

Pattern: `<tagname>` opens, `</tagname>` closes, content goes in the middle.

**The only 10 tags you need to understand your portfolio:**

| Tag | What it does | Example in your site |
|---|---|---|
| `<h1>`–`<h3>` | Headings (big → small) | Your name, section titles |
| `<p>` | Paragraph of text | Descriptions everywhere |
| `<a href="...">` | Link / button | "Message Me" buttons |
| `<div>` | Invisible box (groups stuff) | Cards, sections |
| `<section id="...">` | A page section with an anchor | `#services`, `#pricing` |
| `<ul>` + `<li>` | Bullet list | Feature lists in cards |
| `<img>` | Image | (you'll add your photo — Part 3) |
| `<details>` + `<summary>` | Click-to-expand accordion | FAQ section (free, no JS!) |
| `<nav>` | Top menu bar | The sticky menu |
| `<iframe>` | Embeds another site/video | Your YouTube demo video (Part 4) |

**🎯 Exercise 1:** Open `index.html`, find your hero headline
("I build AI chatbots & automations..."), and change one word. Save, refresh the
page. Congrats — you just edited a website. That's 90% of "web development."

---

## Part 2: CSS — The Clothes 👕 (5 mins)

CSS rules look like this:

```css
selector { property: value; }
```

Example from your site:

```css
.hero h1 { font-size: 3rem; }
```
☝️ = "inside `.hero`, make all `h1` text big."

**Two selector types to know:**

| Selector | Means | Example |
|---|---|---|
| `.name` (dot) | A **class** — reusable style you attach with `class="name"` | `.card`, `.btn-green` |
| `#name` (hash) | An **id** — unique, one element only | `#contact`, `#pricing` |

**The magic variables 🎨:** At the top of the `<style>` block there's a `:root` section:

```css
:root {
  --bg: #0b0f19;       /* page background */
  --accent: #22c55e;   /* main green */
  ...
}
```

Every color on the site references these. Your site is currently themed
**minimalistic black + gold** (`--accent: #d4af37`). Change `--accent` to any color
you like — google "color picker", grab the hex code (looks like `#...`), paste it
in, save, refresh — and the ENTIRE site re-skins. Boom, custom theme.

**🎯 Exercise 2:** Change `--accent` to your favorite color. Google "color picker",
grab the hex code (looks like `#...`), paste it in, save, refresh. Boom — custom theme.

**Responsive design 📱:** Near the bottom of the CSS you'll see `@media` rules.
These say "when the screen is small (phone), do this instead" — like hiding menu
links. Your site already works on phones. Test it: open the site on your phone,
or in Chrome press F12 → click the phone icon → pick a phone size.

---

## Part 3: Make It YOURS — The Customization Checklist ✏️

Search `index.html` for `✏️ EDIT ME` — every spot you need to personalize is marked.
Here's the checklist in order:

### 1. Your name & brand (2 mins)
- `<title>` in `<head>` → your name
- The `.logo` in `<nav>` → your brand (e.g. `troy.builds`, `yourbusinessbot`)
- Hero headline + intro paragraph → your real story

### 2. Your contact links (5 mins) — MOST IMPORTANT ⚠️
**Your live links are already wired in** — here's exactly where each one lives in
`index.html`, so you can change any of them in seconds:

| Link | Where it appears | Current value |
|---|---|---|
| Facebook | Hero button + Project 1 card + Contact card | `https://www.facebook.com/share/1B2Db5JcdP/` |
| Email | Contact card + footer | `mailto:josiahcandia@gmail.com` |
| GitHub | Project 1 card + Contact line + footer | `https://github.com/TechTroyAi` |

> **No TikTok link on purpose.** You don't have one yet, so the site sends people to
> your Facebook link + email instead. When you make one, add it in the Contact section:
> `<a href="https://tiktok.com/@yourhandle">@yourhandle</a>`

**Forking this for your own portfolio?** Search `index.html` for the Facebook
share link and `TechTroyAi` — replace these with your own approved business links
(Facebook → `https://facebook.com/YOUR_PAGE`, email → `mailto:youremail@...`,
GitHub → `https://github.com/YOUR_USERNAME`).

> **Don't have a FB Page yet?** Make one today (free, 10 mins):
> Facebook app → Menu → Pages → Create → name it "[Your Name] — AI Automation & Edits"
> → add your portfolio link in its About section. This is your "business front."

### 3. Your real projects (10 mins)
The `#work` section shows the working browser chatbot and a clearly labeled pilot
invitation, not three unverified projects. Add a new proof card only when you have
an actual recording or directly viewable sample. Do not describe planned builds
as completed work or use a generic social profile as evidence of a specific edit.

Follow [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md) for recordings, guardian contact
review, pilot scope, testimonial consent, and outreach. One real demo beats five
unverified claims.

### 4. Your prices (2 mins)
The defaults (₱1,500 / ₱3,000 / ₱1,000-per-5-vids) are starting service prices to review against your scope and costs.
Keep them until you have 3+ paying clients, then raise 30–50%.

### 5. (Optional) Your photo
Add a profile photo to the hero. Easiest way:
1. Upload your photo to Imgur or your GitHub repo (e.g. `photo.jpg` next to `index.html`)
2. Add this right above the hero `<h1>`:
```html
<img src="photo.jpg" alt="Your name"
     style="width:120px;height:120px;border-radius:50%;object-fit:cover;border:3px solid var(--accent);" />
```

### 6. (Optional) Your colors
Change `:root` variables (Part 2). Dark + one bright accent color always looks pro.

---

## Part 4: Add Your Demo Video 🎥 (the highest-ROI 30 mins)

Clients buy PROOF. A 60-second screen recording of your AI agent working will sell
more than anything else on this page. Here's exactly how (free, phone-friendly):

### Step 1 — Record (10 mins)
- **On phone:** use built-in screen recorder (swipe down → Screen Record). Open your
  project / chatbot / automation and show it working. Talk over it if you can
  ("So when a customer messages 'how much'... the bot replies instantly...").
- **On PC:** use OBS Studio (free) or Loom's free plan.
- Keep it **30–90 seconds**. Show the PROBLEM → your tool → the RESULT.
- Tips: record in landscape, close embarrassing tabs 😅, speak clearly (Bisaya/Tagalog/English all fine).

### Step 2 — Upload to YouTube as Unlisted (5 mins)
1. YouTube app → `+` → Upload video → pick your recording
2. Visibility → **Unlisted** (anyone with the link can watch, but it's not public on your channel)
3. Title it clearly: "AI Chatbot Demo — Auto-reply for FB Pages (by Troy)"
4. Publish → copy the link. It looks like:
   `https://www.youtube.com/watch?v=AbC123xYz00`
   The part after `v=` (`AbC123xYz00`) is your **VIDEO_ID**.

### Step 3 — Embed it in your portfolio (5 mins)
1. Follow the privacy/recording checks in [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md).
2. Add the `.video-wrap` example from that checklist to the relevant proof card.
3. Replace its example video ID with your actual, viewable recording ID.
4. Test the embed signed out and on mobile before publishing.

Until a real recording exists, keep the working chatbot link. Never publish an
empty embed, a “coming soon” box, or a claim you cannot demonstrate.

---

## Part 5: Put It Online (Free Hosting) 🚀

Right now your site only exists on your device. Let's give it a real link you can
send to clients. Two free options — pick one:

### Option A — GitHub Pages (already wired up in this repo)
This repo ships with `.github/workflows/pages.yml`. GitHub Pages is set to **GitHub Actions**, so every push auto-deploys the site.

1. Push your changes:
   ```
   git add -A
   git commit -m "My portfolio v1"
   git push origin main
   ```
2. Wait 1–2 minutes → live at [https://techtroyai.github.io/Automation/](https://techtroyai.github.io/Automation/)
3. Send that link to clients. Put it in your FB Page bio, TikTok bio, everywhere.

On a fork: GitHub.com → repo → **Settings → Pages → Source: GitHub Actions**.

### Option B — Netlify Drop (easiest, no git needed)
1. Go to **app.netlify.com/drop** (free account)
2. Drag your `index.html` file onto the page
3. You instantly get a link like `https://sparkly-name-123.netlify.app`
4. (Optional) Change site name in settings → `troy-builds.netlify.app`

> 📱 **Doing this from your phone?** Both work in a mobile browser. GitHub's mobile
> app can upload/edit files too. You don't need a laptop for any of this.

### Custom domain later (optional, ~₱500/year)
Once you're earning, buy `troybuilds.com` (or `.ph`) on Namecheap/Cloudflare and
connect it — takes 10 mins and looks way more pro. Not urgent. Clients care about
demos, not domains.

---

## Part 6: Get Your First Client (this week) 💰

Your portfolio is the *ammunition*. Now you need *targets*. Full scripts are in
`outreach-scripts.md` — here's the summary:

1. **Today:** portfolio live + FB Page created + join 3 FB groups
   (`Online Jobs PH`, `LDN Buy and Sell`, `AI Automation Philippines`)
2. **Day 2–3:** message 10 local PH shops (food stalls, boutiques, resellers).
   Script + Bisaya version in `outreach-scripts.md`. Attach your portfolio link.
3. **Day 4–5:** post your service in the FB groups (template included).
4. **First reply:** quote fixed price, ask 50% GCash downpayment, build, send demo
   video, collect balance. 🎉
5. **After 2–3 clients:** open Fiverr under dad's verified account
   (gig descriptions ready in `gig-descriptions.md`), raise prices.

### The math that should motivate you 📊
- 1 chatbot client (₱1,500–3,000) = more than a month of survey sites
- 2 clients/month = ₱3,000–6,000, working a few hours a week
- 5 videos/week for a reseller (₱1,000) = steady weekly income

---

## Part 7: Keep Learning (free, in order) 📚

You don't need courses. You need reps. But when you're ready to level up:

1. **HTML/CSS basics** — freeCodeCamp's Responsive Web Design (free, phone-friendly)
2. **JavaScript basics** — JavaScript.info (read Part 1 only, that's enough for now)
3. **n8n** — official n8n YouTube tutorials + self-host free, or use the free cloud trial
4. **Make.com** — their free plan + YouTube guides (easier than n8n to start)
5. **ManyChat** — free plan, the fastest way to ship FB chatbots for clients
6. **CapCut** — you're probably already good; learn auto-captions + templates deeply

**Rule of thumb:** learn just enough to sell the NEXT service, then learn more after
you're paid. Don't tutorial-hell for 3 months with zero income. Build → sell → learn → repeat. 🔁

---

## Part 8: Your Live Demo Chatbot 🤖 (the auto-reply "bit")

That phone-style chat widget in the `#demo` section is your SECRET WEAPON.
Here's why: clients don't understand "AI automation" — but when they TAP a button
and a bot replies instantly, they GET it in 10 seconds. Always put the demo link
first in your outreach messages.

### How it works

The demo has **1,040 authored scripted inputs across 52 topics**. It normalizes
case, punctuation, and spacing; checks exact questions first; then matches
whole-word phrases. More specific phrases beat generic price/order words.
Equal-strength topics ask for clarification; unknown text gets an honest fallback.
It is not a live AI and does not place orders, accept payments, or notify staff.
Typed messages are rendered as text, never HTML, and stay only in page memory.

### Customize the replies

Read [CHATBOT.md](CHATBOT.md), then edit `scripts/chatbot-topics.txt`. Each topic
has an ID/label, keywords, a plain-text reply, and semicolon-separated questions.
After editing, run `node scripts/build-chatbot.js` and `node --test tests/*.test.js`.
Commit the source plus generated `assets/chatbot-data.js` together.

The demo section is chat-only on purpose: visitors type an order such as
`2 Classic with extra pearls, delivery` and the bot totals it locally through
`assets/order-calculator.js`. See
[CHATBOT.md](CHATBOT.md#sample-price-calculator-chat-only) for supported syntax,
pricing rules, and why no payment preview is shipped.

Change the fictional shop's header, greeting, quick replies, and source responses
as a set. Use only verified business facts for a real client. No invented stock,
allergen guarantees, live delivery estimates, or personal home addresses.

**Exercise:** add a specific question to an existing topic, regenerate, and test
that its exact input returns the intended response. Update visible counts if the
library grows; the test suite catches stale counts.

### Demo bot vs. REAL client bots (important!)

| | Portfolio demo bot | Real client bot |
|---|---|---|
| Runs on | This page (JavaScript) | Client's FB Page (ManyChat / n8n) |
| Brain | Scripted question/phrase matching | Rules and/or AI, with testing and fallbacks |
| Cost to run | Free forever | Free–cheap (ManyChat free tier / n8n) |
| Purpose | SELL the service | DELIVER the service |

The demo's job is to make the client say "gusto ko ana!" — then you build the real
thing with **ManyChat** (fastest for FB auto-reply, free plan) or **n8n + AI**
(for fancier workflows). Learn those AFTER you land client #1 (Part 7 has links).
Don't learn first, earn first — the tools take a weekend to pick up when you have
a paying reason. 💰

---

## Quick Reference Card 🃏

| I want to... | Do this |
|---|---|
| Change text | Edit the HTML between the tags |
| Change colors | Edit `:root` variables in `<style>` |
| Add a new section | Copy a `<section>...</section>` block, change content + `id` |
| Add a nav link | Add `<li><a href="#new-id">Label</a></li>` in `<nav>` |
| Add demo video | Part 4 ↑ (YouTube Unlisted + `video-wrap`) |
| Change chatbot replies | Edit `scripts/chatbot-topics.txt`, then regenerate (Part 8 ↑) |
| Preview changes | Save file → refresh browser (Ctrl+R / pull-to-refresh) |
| Put it online | Part 5 ↑ (GitHub Pages or Netlify) |
| Something broke? | Undo (Ctrl+Z), save, refresh. HTML never "breaks permanently" — worst case, re-download this file from git |

---

*Built for Troy · the Philippines 🇵🇭 · Questions? Re-read the section above — the answer is almost always there. You've got this, bro.* 💪
