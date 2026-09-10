# Troy.Builds — AI Automation Portfolio 🖤💛

> Personal portfolio of **Troy Candia**, an AI automation builder & video editor from
> Tubod, Lanao del Norte (LDN), Philippines. Features a **live interactive chatbot demo**, service
> packages, transparent pricing, and a client-ready contact flow.

[![Live Site](https://img.shields.io/badge/🌐_Live-techtroyai.github.io/Automation-d4af37?style=for-the-badge)](https://techtroyai.github.io/Automation/)
[![License: MIT](https://img.shields.io/badge/License-MIT-d4af37?style=flat-square)](LICENSE)
![HTML5](https://img.shields.io/badge/HTML5-standalone-orange?style=flat-square&logo=html5)
![CSS3](https://img.shields.io/badge/CSS3-no_frameworks-blue?style=flat-square&logo=css3)
![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-yellow?style=flat-square&logo=javascript)

**🔗 Live site:** [techtroyai.github.io/Automation](https://techtroyai.github.io/Automation/)

---

## ✨ Features

- 🤖 **Live chatbot demo** — visitors chat with a simulated shop auto-reply bot (keyword engine in vanilla JS, works offline)
- 💬 **Service catalog** — FB chatbots, n8n/Make automations, custom AI tools, video editing
- 💰 **Transparent pricing** — GCash-friendly packages in PHP (₱), with a highlighted "most popular" tier
- ✅ **Process section** — the 5-step client journey, so buyers know exactly what happens next
- ❓ **FAQ accordion** — handles objections before the first message (pure HTML, zero JS)
- 📱 **Fully responsive** — mobile-first, with a real hamburger menu (not just hidden links)
- ♿ **Accessible** — skip link, visible keyboard focus rings, `prefers-reduced-motion` support
- 🔍 **SEO + share ready** — canonical URL, Open Graph/Twitter cards, `Person`/`Offer` structured data
- ✨ **Polished details** — scroll progress bar, reveal-on-scroll, back-to-top, themed 404 page
- ⚡ **Zero dependencies** — one HTML file, no build step, no frameworks, loads instantly

## 📁 Project Structure

```
├── index.html            # The entire site — standalone, no build step
├── 404.html              # Themed GitHub Pages 404 → sends visitors home
├── favicon.png           # Tab icon
├── og.jpg                # Social share card (FB / Messenger / Twitter)
├── TUTORIAL.md           # Full guide: how it works, customize, host, get clients
├── gig-descriptions.md   # Copy-paste gigs for Fiverr / Upwork / FB groups
├── outreach-scripts.md   # DM scripts (English + Bisaya) for local outreach
├── .nojekyll             # Tells GitHub Pages to skip Jekyll
├── .github/workflows/pages.yml  # Auto-deploys to GitHub Pages on push
├── LICENSE               # MIT License
└── .gitignore
```

## 🛠️ Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Structure | HTML5 | Semantic, accessible, SEO-friendly |
| Styling | Vanilla CSS (custom properties) | One `:root` theme block re-skins the whole site |
| Behavior | Vanilla JavaScript | Scroll reveals + keyword chatbot — no libraries needed |
| Hosting | GitHub Pages | Free, auto-deploys on every push |

## ⚡ Quickstart

```bash
# 1. Clone
git clone https://github.com/TechTroyAi/Automation.git
cd Automation

# 2. Open — that's it. No install, no build.
open index.html        # or just double-click the file

# Or serve it locally (needed if you want a real http:// URL)
python3 -m http.server 8080 --bind 0.0.0.0
# then open http://localhost:8080
```

> The site works fully offline — open it in airplane mode and the demo bot still replies. ✈️

## 🌐 GitHub Pages

This repo is set up as a **project site**. After the Actions workflow runs, the live URL is:

**https://techtroyai.github.io/Automation/**

How it deploys:

1. Merge to `main` (GitHub Pages is locked to that branch)
2. The [Pages workflow](.github/workflows/pages.yml) uploads `index.html` + assets
3. GitHub serves them at the URL above — usually within 1–2 minutes

First time on a fork? Repo → **Settings → Pages → Source: GitHub Actions**.

## 🎨 Customization

Every editable spot in `index.html` is marked with `✏️ EDIT ME`. The essentials:

| Change | Where |
|---|---|
| Name, headline, bio | Hero section |
| Brand name (`troy.builds`) | Navbar `.logo` + 404 page |
| Contact links (Messenger, FB, email, TikTok, GitHub) | Hero buttons + Contact section |
| Projects & demo videos | `#work` section (YouTube embed supported) |
| Prices & packages | `#pricing` section |
| Theme colors | `:root` block in `<style>` (currently black + gold `🖤💛`) |
| Chatbot replies & demo shop | `BOT_RULES` in `<script>` |

📖 **New to code?** Read [`TUTORIAL.md`](TUTORIAL.md) — a beginner-friendly walkthrough of how every part works, how to add demo videos, and how to host it free.

## 🗺️ Roadmap

- [x] v1 — Portfolio + live chatbot demo + black/gold theme
- [ ] Embed real AI-agent demo videos (screen recordings)
- [ ] Client testimonials section
- [ ] Custom domain (`troybuilds.com`)
- [ ] Sellable n8n workflow templates

## 👤 Author

**Troy Candia** — Tubod, Lanao del Norte (LDN), Philippines 🇵🇭

- 💬 Messenger: [m.me/TroyCandia](https://m.me/TroyCandia)
- 📘 Facebook: [facebook.com/TroyCandia](https://facebook.com/TroyCandia)
- 💻 GitHub: [@TechTroyAi](https://github.com/TechTroyAi)

Open to freelance projects — chatbots, automations, and video edits for PH businesses. GCash accepted. 🙏

## 📄 License

This project is open source under the [MIT License](LICENSE) — feel free to fork it for your own portfolio, just leave a ⭐ if it helped you.

---

<p align="center">Built by hand in Tubod, LDN · Powered by kape ☕</p>
