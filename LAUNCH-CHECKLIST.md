# Before outreach: evidence, privacy, and first clients

The page now shows only the working browser chatbot as proof, plus a clearly
labeled pilot invitation. There are no invented testimonials or unrecorded
projects presented as completed client work. These steps still need Troy's review
and real-world action; code cannot do them for you.

## 1. Record one real demo (30–60 seconds)

- [ ] Test `menu`, `delivery fee`, `cancel my order`, `chatbot pricing`, and an
      unknown question. Record only what actually works.
- [ ] Use fictional test data; close notifications and hide account names,
      customer messages, phone numbers, addresses, tokens, and payment details.
- [ ] Record the screen on your phone or computer. Suggested sequence:
      0–10s: explain the repetitive FAQ problem; 10–40s: show the specific replies;
      40–60s: show the fallback and explain that a real integration is separate.
- [ ] For an automation recording, show the actual trigger → run → result using
      test data. Do not claim a Sheets/Facebook integration from this local demo.
- [ ] Upload to YouTube as **Unlisted**. Anyone with its link can still watch or
      reshare it; unlisted is not private. Check embedding is allowed.
- [ ] Add a direct recording link or privacy-enhanced YouTube embed to the proof
      card only after checking it signed out and on mobile. The CSS already
      includes `.video-wrap`. Example to adapt with your **real** video ID:

```html
<div class="video-wrap">
  <iframe src="https://www.youtube-nocookie.com/embed/YOUR_REAL_VIDEO_ID"
    title="Shop FAQ bot — recorded working demo"
    loading="lazy" referrerpolicy="strict-origin-when-cross-origin"
    allow="encrypted-media; picture-in-picture" allowfullscreen></iframe>
</div>
```

Do not publish the example ID or another “coming soon” placeholder. Note that a
third-party embed loads external resources; update the privacy wording if needed.
Editing samples should link directly to a specific viewable before/after clip,
not a generic profile. Keep unverified projects off the proof section.

## 2. Review public contact details with your dad/guardian

- [ ] Decide together whether to keep the existing Messenger/Facebook links or
      replace them with a business Page or shared/monitored inbox you control.
      This PR **does not claim the current account is monitored**.
- [ ] The page, metadata, README, and share image no longer advertise your exact
      hometown, age, full-name heading, or personal email. Existing social links
      still identify their account owner; this is exposure reduction, not anonymity.
- [ ] Check the public social profiles, GitHub profile, license attribution, old
      commits, cached search results, and old share previews too. This change does
      not rewrite Git history or erase information already published.
- [ ] Keep payment recipient details private and guardian-reviewed. Verify the
      contact and written scope before taking a deposit. Never request passwords,
      OTPs, or account recovery codes from a client.
- [ ] If you later add an email, use only a working address you and your guardian
      have approved. Do not publish a fake contact or put credentials in this repo.

## 3. Turn a small pilot into genuine proof

- [ ] Pick **one or two** suitable businesses. Confirm availability rather than
      creating a fake countdown or client count.
- [ ] Agree in writing: one small deliverable, free/discounted price, any tool
      costs, timeline, revision limit, acceptance test, and support end date.
- [ ] Ask for **honest** feedback after they have tried it. Never require praise.
- [ ] Ask separately for permission to show a **redacted** demo and to publish their
      exact quote, display name/business name, and optional logo. No consent → no
      public identity or testimonial. Do not assume permission for customer data.
- [ ] Disclose that the work was free or discounted when publishing a review.
      Verify any before/after numbers; don't invent hours saved or extra sales.
- [ ] Remove or update the pilot invitation once the initial slots are filled.

Sample permission request:

> Thanks for trying the pilot! What worked, and what should I improve? May I
> publish your exact feedback as “[approved quote]” under “[approved display
> name]”? Separately, may I show this redacted demo: [link]? I'll mention that
> this was a free/discounted pilot. Please approve each item you are comfortable
> with; I won't publish identifying details without your permission.

## 4. Send people to the working demo

GitHub Pages can be indexed, but publishing a page does not guarantee search
visibility, traffic, or clients. Use it as evidence in relevant conversations.

- [ ] Personalize a small first batch (for example, 5–10 suitable shop Pages).
      Mention one real observation; don't invent a problem or prior relationship.
- [ ] Link to `https://techtroyai.github.io/Automation/#demo` after the PR is merged
      and deployment succeeds. Ask permission before sending more material.
- [ ] Post only in groups that permit promotions, following their rules.
- [ ] Follow up at most once after 2–3 days, then stop. Honor opt-outs immediately.
- [ ] Track business name, date, channel, reply, and next step privately. Do not
      commit prospects' personal details or screenshots to the public repo.

Use [`outreach-scripts.md`](outreach-scripts.md) for ready-to-edit messages. Results
are uncertain; the aim is a few relevant conversations, not spam or promised sales.
