# Troy.Builds — AI Automation Portfolio 🖤💛

Portfolio for Troy's chatbot, automation, and video-editing services for PH
businesses. Includes a **working, fictional shop chatbot**, transparent service
pricing, a pilot-client invitation, and a Messenger contact flow.

**Live site:** https://techtroyai.github.io/Automation/

## Features

- **1,040 authored scripted questions across 52 topics**, with English, Tagalog,
  and Bisaya examples: shop FAQs plus questions about portfolio services.
- Deterministic replies: exact questions first, whole-word phrases next,
  clarification for equally strong matches, and an honest unknown-question fallback.
- Working demo as proof—no unfinished video placeholders, invented testimonials,
  fake client results, or implied live integrations.
- Pilot invitation for the first 1–2 small free/discounted builds, subject to fit,
  with honest feedback and separate permission before public use.
- Reduced public personal information; existing social links remain until the
  owner and guardian choose a suitable contact channel.
- Responsive black/gold layout, mobile menu, FAQ accordion, keyboard focus,
  reduced-motion support, metadata, and a branded social share image.
- No runtime dependencies, backend, API key, or visitor-message storage.

## Project structure

```text
index.html                    # Layout, styles, navigation, and chat UI
assets/chatbot.js             # Pure deterministic matcher (browser + Node)
assets/chatbot-data.js        # Generated, checked-in question/reply library
scripts/chatbot-topics.txt    # Editable source: 52 topics × 20 scripted inputs
scripts/build-chatbot.js      # Generates/checks the browser data file
tests/                       # Node regression tests + optional browser smoke test
404.html                     # GitHub Pages error page
favicon.png / og.jpg          # Brand assets
CHATBOT.md                   # Matching rules, all-topic index, customization
LAUNCH-CHECKLIST.md           # Real recordings, consent, guardian review, outreach
TUTORIAL.md                   # Beginner guide
outreach-scripts.md           # English + Bisaya outreach and pilot scripts
gig-descriptions.md           # Service listing templates to review before use
.github/workflows/pages.yml  # PR verification, deployment only from main
```

## Run locally

Open `index.html` directly, **keeping `assets/` alongside it**, or serve the folder:

```sh
python3 -m http.server 8080 --bind 0.0.0.0
```

The chatbot works offline; external Messenger/GitHub links need internet access.
This is a scripted demonstration, not a real shop or live AI. It cannot place
orders, take payments, access Google Sheets, or notify a human.

## Edit and test

Node 22 is used for authoring and tests, not for hosting or visiting the page.

```sh
# Edit scripts/chatbot-topics.txt, then:
node scripts/build-chatbot.js
node scripts/build-chatbot.js --check
node --testtests/*.test.js
```

Every one of the 1,040 inputs is tested against its intended response. Regression
checks cover normalization, phrase priority, false substring matches, ambiguous
questions, input rendering, demo limitations, and deployed assets.
See [CHATBOT.md](CHATBOT.md) for the format and optional Chromium smoke tests.

| Customize | Where |
|---|---|
| Brand, pitch, services, prices | `index.html` |
| Contact destination | Hero, pilot CTA, Contact, JSON-LD, and README social links |
| Questions, keywords, answers | `scripts/chatbot-topics.txt`, then regenerate |
| Matching behavior | `assets/chatbot.js` |
| Real recorded demos | `#work`, following `LAUNCH-CHECKLIST.md` |
| Colors | CSS `:root` variables |

Keep service replies synchronized with visible prices and terms. Changing prices
in the HTML does not automatically update the scripted answers. Update the
visible question/topic count if the library size changes; tests detect drift.

## Deployment

1. Open a PR and review the checks. PRs do **not** deploy the live page.
2. After owner approval and merge to `main`, Actions checks and uploads the HTML,
   images, and `assets/` folder to GitHub Pages.
3. Verify https://techtroyai.github.io/Automation/ and its chatbot on mobile.

On a fork: Settings → Pages → Source → GitHub Actions.
No bundler or install step is required for the deployed site.

## Before sending this to prospects

Follow [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md): record actual work, review the
public contact channel with a guardian, get explicit testimonial/demo permission,
and send relevant, respectful outreach. A site alone does not guarantee traffic.

Real videos and client feedback still require real-world work. Current privacy
changes do not remove identifying social profiles, license attribution, old Git
history, or cached copies. Messenger is retained, **not claimed to be monitored**.

## Contact

- Messenger: https://m.me/TroyCandia
- Facebook: https://facebook.com/TroyCandia
- GitHub: https://github.com/TechTroyAi

## License

[MIT](LICENSE). Original attribution is preserved.
