# Face Quest — Etsy Listing Playbook

**Seller-only. Never paste this file verbatim into Etsy.** Pull the snippets you need, customize, publish.

> 🛒 [Open Etsy "Create a Listing"](https://www.etsy.com/your/shops/me/listing-editor/create)

---

## 1. Product positioning

**Face Quest** is an in-browser face recognition lab for kids, classrooms, and curious makers. Three tiny face-api.js models (face detector, 68-point landmarks, 128-number face recognition) run entirely on the buyer's laptop. No photos are ever saved, no cloud, no account. Optional BLE UART link to a BBC micro:bit V2 turns any verify into a real-world ✓ / ✗ on the LED grid.

**One-liner pitch:**
> Teach a browser your face in 60 seconds. No photos saved, no cloud, no account.

**Who buys:**
- STEM / AI literacy teachers (ages 9+)
- Home-schooling parents
- Coding clubs / makerspaces
- Hobbyists prototyping on-device face recognition

---

## 2. Canonical listing title

**140-char limit. Pick one; A/B test over the first 30 days.**

Variant A (buyer intent — clean lead):
```
Face Quest — In-Browser Face Recognition Lab for Kids & Classrooms · Webcam + micro:bit · Learn Spot Play · No Cloud · Chrome / Edge
```

Variant B (teacher angle):
```
Face Quest AI Literacy Kit — Browser Face Recognition for STEM Classrooms · 45-min Lesson Plan · 30 Stickers · Webcam + micro:bit V2
```

Variant C (privacy angle):
```
Face Quest — Privacy-First Face Recognition App for Kids · Runs Locally · No Photos Saved · Webcam + micro:bit · Digital Download
```

---

## 3. Short description (first 160 chars — shown in search)

```
In-browser face recognition lab for kids & classrooms. Three AI models run locally — no photos saved. Webcam + optional BBC micro:bit V2. Chrome / Edge.
```

Alt:
```
Teach a browser your face in 60 seconds. Privacy-first AI lab for STEM classrooms. Webcam + micro:bit V2. 45-min lesson plan + 30 stickers.
```

---

## 4. Full description (paste block)

```
🧠 Face Quest — an in-browser face recognition lab for kids, classrooms, and makers.

Open one HTML file in Chrome or Edge, allow the webcam, and teach the app your face. Three tiny AI models run entirely on your laptop — no photos saved, no cloud, no account.

WHAT YOU GET
• 📷 Live face scanner with mirror, switch-camera, and scanline overlay
• 🧠 "Teach My Face" 1:1 enrollment (collects sharp samples, saves a 128-number descriptor)
• 🔓 "Unlock" verify loop with MATCH / NO MATCH + XP gamification
• 📐 Threshold dial (Euclidean or Cosine), SSD or Tiny detector
• 🔒 Auto-lock after a few seconds of no face in frame
• 🔑 PIN-gated Test Mode for continuous-scan demos
• 🎤 Voice commands ("Start", "Teach", "Unlock", "Lock", "Reset") + 🔊 spoken feedback
• 🤖 BLE UART link to a BBC micro:bit V2 — MATCH / NO / ENROLLED / LOCK / TEST
• 🧾 Timestamped, color-coded Quest Log console
• 📱 Installable PWA — works offline after first load

WHAT'S IN YOUR DOWNLOAD
• index.html, app.js, styles.css — the full Face Quest Lab
• face-api.min.js + /models — the 3 AI brains bundled
• ble_microbit.js + microbit.ts — Robot Buddy firmware for MakeCode
• README.md — kid-friendly overview
• USERGUIDE.html & .md — full setup + troubleshooting
• Printables: A4 Quick-Start card, A4 Controls cheat sheet, A3 classroom poster, 45-min lesson plan, 30 achievement stickers
• LICENSE — personal / classroom single-user license

REQUIREMENTS
• A webcam (built-in or USB)
• Chrome or Edge on desktop (getUserMedia + Web Bluetooth)
• A way to serve the folder over HTTP locally (the guide shows python3 -m http.server)
• Optional: BBC micro:bit V2 for the Robot Buddy demo

WHO IT'S FOR
Teachers running AI literacy lessons · home-schooling families · robotics & coding clubs · makers prototyping on-device recognition · curious kids ages 9+.

PRIVACY FIRST
No photos are ever saved. face-api.js runs in your browser; only a 128-number face descriptor lives in IndexedDB, which you can wipe with Reset Face. No accounts, no cloud, no analytics, ever.

LIFETIME UPDATES
Every version shipped from this listing is yours forever. Re-download the latest ZIP anytime from your Etsy Purchases page.

Happy hacking! 🧠📷🔓
```

---

## 5. Etsy tags (13 × 20 chars max)

```
face recognition, AI for kids, STEM, education, micro:bit, webcam project, coding club, teacher resource, classroom, home school, privacy first, browser app, makerspace
```

**Backup pool** (rotate when refreshing the listing):

- `face-api.js`, `AI literacy`, `kids AI`, `STEM workshop`, `edtech`, `digital download`, `robotics club`, `bluetooth`, `web bluetooth`, `ai ethics`

## 6. Materials (Etsy's "what it's made of" field)

```
HTML5, JavaScript, face-api.js, Web Bluetooth, IndexedDB, PWA, MakeCode, TypeScript
```

---

## 7. Pricing tiers

| Tier | Who | Price (USD) | Notes |
|---|---|---|---|
| Launch / early-bird | First 100 buyers | `$14.99` | First 2 weeks after go-live |
| Standard single-user | One teacher / family / maker | `$19.99` | Permanent baseline |
| Bundle (all extras) | Single-user + all printables + lesson pack | `$34.99` | Upsell in the FAQ section |
| Tripwire | Quick-Start card only, to seed buyers | `$5` | Low-friction first purchase |
| Site / Classroom | One school, unlimited students & teachers | `$249` | Separate listing, uses `LICENSE-SITE` |
| District / OEM | Multiple sites — DM through the Etsy order | `$599+` | Custom; issue a certificate |

**Launch promo:** share code `QUESTLAUNCH` on launch day → drops single-user to `$8` for the first 48 hours.

---

## 8. The 7-image listing order

1. **Hero** — Face Quest scanner open, face box + landmark dots on the seller's face, "🧠 Teach My Face" button glowing. Title overlay in Orbitron. (Etsy square-crops: keep the title + compat badge inside the center 1500×1500.)
2. **What's in the ZIP** — 10-item manifest grid revealing value before the feature deep-dive.
3. **Feature grid** — 16 features (scanner, teach, unlock, threshold, BLE, PIN, auto-lock, voice, speech, Quest Log, XP, etc.).
4. **Teacher pitch** — "Made for Teachers" with two teacher/IT quotes.
5. **Kid pitch** — big, playful: "You Taught The Computer Your Face!".
6. **How it works** — the three AI models (detector, landmarks, recognition) explained visually.
7. **Privacy promise** — 3-up card: "No photos", "No internet", "No account".

Rendered automatically from `etsy-listing-mockups.html` into `output/etsy-mockup-1.png` … `etsy-mockup-7.png` by `build-package.js`.

---

## 9. Video storyboard (60 s, 9:16 portrait)

| Time | What to SAY | What to SHOW |
|---|---|---|
| 0–3 s | "In 60 seconds I'll teach a browser to recognise my face — and nothing leaves my laptop." | Face Scanner hero: face box pulsing on your face |
| 3–10 s | "One folder, three AI models, zero accounts." | Click 🚀 Start Mission. Quest Log: detector / landmarks / recognition loaded |
| 10–20 s | "Centre my face. Click Teach. It saves 128 numbers — not a photo." | Click 🧠 Teach My Face. Cut to DevTools → IndexedDB (numbers visible) |
| 20–35 s | "Step back, step forward. Unlock — match. Friend steps in. No match." | Click 🔓 Unlock → MATCH ✅. Friend swaps → NO MATCH ❌ |
| 35–50 s | "Optional: pair a micro:bit. The match lights a real LED." | 🤝 Connect board. Unlock → micro:bit ✓, P0 HIGH |
| 50–55 s | "Full kit, lesson plan, 30 stickers — link below." | Face-cam, eye contact, shop handle overlay |
| 55–60 s | "Happy hacking." | Hold still. Logo + handle = loop frame |

Detailed version lives in `ETSY-1MIN-PLAYBOOK.md` and `etsy-playbook.html` (EN/FR/AR).

---

## 10. FAQ block for the listing (optional)

**Q: Is my face sent anywhere?**
A: No. face-api.js runs in your browser. The only thing stored is a 128-number descriptor in IndexedDB, and you can wipe it with Reset Face.

**Q: Do I need the micro:bit?**
A: No. The core Face Quest app works with just a webcam. The BBC micro:bit V2 is an optional Robot Buddy for the ✓ / ✗ LED demo.

**Q: What browsers are supported?**
A: Chrome and Edge on desktop. Safari and Firefox do not implement Web Bluetooth, and Safari is picky about `getUserMedia`.

**Q: Does it work offline?**
A: Yes. Face Quest ships as an installable PWA. After the first load, it works with Wi-Fi off.

**Q: Can I use this in a class of 30?**
A: Yes with the Site license ($249) — one school, unlimited teachers and students.

**Q: Does it speak my language?**
A: The Face Quest app ships in English. Seller-side playbooks for shop owners are available in English, French, and Arabic. UI localization is on the roadmap.

---

## 11. Cross-sell ladder

1. **Tripwire** ($5) — Quick-Start card only. Low-friction intro.
2. **Standard** ($19.99) — full Face Quest app + all printables.
3. **Bundle** ($34.99) — Standard + lesson pack + sticker sheet + A3 poster PDFs unlocked.
4. **Site** ($249) — Bundle + `LICENSE-SITE` for one school.
5. **District** ($599+) — DM on Etsy, custom certificate issued from `SITE_LICENSE_CERTIFICATE.html`.

---

## 12. Social copy snippets

**Pinterest (EN):**
> Teach AI without sending a single photo to the cloud. Face Quest is an in-browser face recognition lab for kids and classrooms. Three local AI models, webcam + optional BBC micro:bit V2. Instant Etsy download. #AIforkids #STEMclassroom #microbit #privacyfirst

**Pinterest (FR):**
> Apprenez l'IA sans envoyer une seule photo au cloud. Face Quest : un labo de reconnaissance faciale dans le navigateur pour enfants et classes. Trois modèles d'IA locaux, webcam + micro:bit V2 optionnel. Téléchargement Etsy instantané.

**Pinterest (AR):**
> علِّم الذكاء الاصطناعي دون إرسال أيّ صورة إلى السحابة. Face Quest: مختبر تعرّف على الوجوه داخل المتصفّح للأطفال والصفوف. ثلاثة نماذج ذكاء اصطناعي محلّية، كاميرا ويب + micro:bit V2 اختياري.

**Instagram reel caption:**
> My laptop just recognised my face. No cloud. No photos. A 128-number descriptor, stored in the browser. Full kit on Etsy — link in bio. #AIforkids #STEMteacher

**TikTok hook (first 1.5 s on screen):**
> "I taught a browser my face — offline."

---

## 13. SEO keyword cloud

`in-browser face recognition` · `no photos saved` · `privacy-first AI` · `offline-capable` · `web bluetooth micro:bit` · `AI literacy lesson` · `kids coding` · `face-api.js classroom` · `STEM ages 9+` · `edtech digital download` · `micro:bit V2 project`

---

## 14. 10 tier-2 spin-off product ideas

Each one re-uses the Face Quest core + a printable pack. Good test listings.

1. **Face Quest Classroom Bundle** — base app + printables + unlocked lesson pack at $34.99.
2. **AI Literacy Workbook PDF** — 20-page printable workbook aligned to the lesson plan. $9.
3. **A3 Classroom Poster PDF** — standalone poster, sold to teachers who only want the wall piece. $3.
4. **30 Sticker Sheet PDF** — standalone sticker sheet for reward systems. $4.
5. **Privacy-First AI Glossary Card** — printable A5 glossary of "detector / landmarks / descriptor / threshold". $4.
6. **MakeCode Firmware Pack** — the `microbit.ts` Robot Buddy + 3 extensions (LED animations, sound on match, buzzer on no-match). $6.
7. **Site License PDF + Certificate** — separate listing for schools buying directly. $249.
8. **District License** — configured-per-order. $599+.
9. **Teacher PD Deck** — 30-slide Google Slides deck for teachers running an AI workshop. $14.
10. **Face Quest Kids Workbook (printable)** — fill-in-the-blank workbook for ages 9–12. $7.

---

## 15. Content calendar (first 30 days)

| Day | Channel | Asset |
|---|---|---|
| 0 (launch) | Etsy + Pinterest | Go-live, post 4 pins |
| 1 | Instagram reel | Hero demo (60 s) |
| 3 | TikTok | Same demo, UGC cut |
| 5 | Pinterest | "What's in the ZIP" pin |
| 7 | Email list | Launch note + `QUESTLAUNCH` promo reminder |
| 10 | Teacher blog outreach | Cold email (template below) |
| 14 | Pinterest | "4 things your kids can learn from Face Quest" |
| 21 | Instagram reel | Classroom angle |
| 28 | Pinterest | "AI ethics classroom discussion prompts" |
| 30 | Retrospective | Review analytics, iterate title |

---

## 16. Teacher outreach email template

```
Subject: A privacy-first AI demo your students can run in the browser

Hi [Name],

I run a small Etsy shop — I make Face Quest, a browser-based face recognition lab built for AI literacy lessons. Three tiny AI models run locally on the student's laptop, nothing leaves the device, and there's a 45-minute lesson plan included.

If you're teaching anything about face ID, biometrics, or AI ethics this term, it might save you a prep cycle. Happy to send a free site license to [School Name] if you'd like to try it with your class.

[Etsy URL]

Thanks either way,
[Your name]
```

---

## 17. Pre-publish checklist

- [ ] Title under 140 chars
- [ ] 160-char short description written
- [ ] 13 tags filled (no duplicates of words in the title)
- [ ] 7 mockup PNGs rendered from `etsy-listing-mockups.html`
- [ ] 60-s MP4 uploaded, first frame is the hero
- [ ] ZIP attached — check the FaceQuest-v1.0.0.zip link resolves
- [ ] Pricing matches the tier table
- [ ] `QUESTLAUNCH` promo code scheduled on Etsy for the first 48 h
- [ ] Site license variant exists as a separate listing
- [ ] Buyer `LICENSE.txt` is inside the ZIP
- [ ] `seller-only/` is NOT inside the ZIP

---

*Face Quest v1.0.0 — seller-only listing playbook. Never paste this file verbatim. Pull the blocks you need.*
