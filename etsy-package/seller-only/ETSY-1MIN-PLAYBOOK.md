# Face Quest → Etsy 1-Minute Demo Playbook

**For Etsy listing videos (60-second cap, 9:16 portrait, autoplay-muted preview).**

A second-by-second script: **what to say** + **what to click / do** to produce a tight Etsy demo that converts. Keep this open on a second monitor or print A4.

---

## Etsy video specs (memorise once)

| Spec | Value |
|---|---|
| **Length** | Max 60 seconds (aim for 55 s to be safe) |
| **Aspect** | **9:16 portrait** — Etsy autoplays in the mobile feed |
| **Resolution** | 1080 × 1920 minimum |
| **Codec** | MP4 / H.264 + AAC audio |
| **File size** | Under 100 MB |
| **Audio** | Muted by default in feed → **captions or on-screen text are mandatory** |
| **Cover frame** | First frame becomes the thumbnail — make it visually loud |
| **Hook window** | First 3 seconds decide whether a scroller stops |

---

## Pre-flight checklist (90 seconds, do once per shoot)

Before you press Record:

- [ ] Laptop webcam clean, front-lit, plain background
- [ ] Chrome or Edge open, folder served via `python3 -m http.server 8012`, Face Quest loaded at `http://localhost:8012`
- [ ] Clicked **🚀 Start Mission** once — "Camera: ON" pill green, three AI models logged loaded
- [ ] Previous enrollment cleared with **🧹 Reset Face** so Teach shows a real first-time flow
- [ ] **Threshold** at 0.60, **Verify frames** at 12 (defaults — cleanest demo)
- [ ] Optional: BBC micro:bit V2 powered, MakeCode BLE UART sketch flashed, not yet connected
- [ ] Phone in 9:16 on a tripod, front-lit, clean background
- [ ] Desk cleared — only the laptop (and the micro:bit if used) in frame
- [ ] Captions app running OR on-screen text plan ready
- [ ] Script read aloud once, timed under 55 seconds
- [ ] Phone silenced, kids / dogs warned

---

## The 60-second arc

```
 0–3 s   HOOK        "Watch a browser learn my face in 60 seconds."
 3–10 s  CONTEXT     Start Mission → camera on → detector boxes appear.
10–35 s  DEMO        Teach My Face → Unlock match → friend swap → NO MATCH.
35–50 s  PAYOFF      Optional: micro:bit shows ✓ on MATCH, drives P0 HIGH.
50–55 s  CTA         "Full kit, lesson plan, stickers — link below."
55–60 s  END FRAME   Logo + handle frozen for the loop preview.
```

Etsy loops the video, so the **end frame should match the cover** — keeps viewers watching the loop.

---

## Script Template A — "Teach the app your face" (hero demo)

**Use case:** the main Etsy listing video. Showcases Start → Teach → Unlock + the privacy promise in one go.

| Time | What to SAY | What to CLICK / DO |
|---|---|---|
| 0–3 s | *"In 60 seconds I'll teach a browser to recognise my face — and nothing leaves my laptop."* | Close-up on the Face Scanner: face box + landmark dots pulsing on your face. |
| 3–10 s | *"One folder, one click. Three tiny AI models load from disk."* | Click **🚀 Start Mission**. Quest Log ticks: detector / landmarks / recognition loaded. |
| 10–20 s | *"Centre my face. Click Teach. It saves a string of 128 numbers — not a photo."* | Click **🧠 Teach My Face**. Samples collected. XP bumps up. Cut to DevTools → IndexedDB shows numbers, not an image. |
| 20–30 s | *"Step back, step forward. Unlock."* | Click **🔓 Unlock!** → "MATCH ✅". |
| 30–35 s | *"Friend steps in. No match."* | Friend enters the frame. Click Unlock → "NO MATCH ❌". |
| 35–50 s | *"Optional: pair a micro:bit. The match lights a real LED grid."* | Click **🤝 Connect**, pick the board. Unlock → micro:bit shows ✓, P0 HIGH. Tight shot. |
| 50–55 s | *"Full kit, lesson plan, 30 stickers — link below."* | Face-cam back on. Eye contact. |
| 55–60 s | *"Happy hacking."* | Hold still. Logo + handle overlay freezes. This becomes the loop frame. |

---

## Script Template B — "Teacher Tuesday" (classroom angle)

**Use case:** targeting teachers and STEM / AI literacy workshop organisers.

| Time | What to SAY | What to CLICK / DO |
|---|---|---|
| 0–3 s | *"Teach AI without sending a single photo to the cloud."* | Overhead shot of a laptop + the printable lesson plan + sticker sheet on a desk. |
| 3–10 s | *"One folder served locally. Three AI models, zero accounts."* | Click Start Mission. Quest Log shows models loaded. |
| 10–20 s | *"Kids enroll their face — only a descriptor is saved, never a photo."* | Teach My Face. Open DevTools → IndexedDB → point at the number array. |
| 20–30 s | *"Slide the Threshold. Watch strict turn into loose in real time."* | Move Threshold from 0.40 to 0.90. Unlock at each value. Narrate the change. |
| 30–40 s | *"30 printable stickers. 45-minute lesson plan with rubric. A3 classroom poster."* | Cut to the printables flat-lay. |
| 40–50 s | *"Site license, one school, unlimited students."* | Text overlay with the licensing tiers + Etsy shop name. |
| 50–60 s | *"Link below. Tag me when you run it in class."* | Face-cam, hold the printable poster, smile, freeze on logo. |

---

## Script Template C — "Kid teaches a computer" (parent / home-school angle)

**Use case:** showing a young maker using the app — UGC / influencer feel.

| Time | What to SAY | What to CLICK / DO |
|---|---|---|
| 0–3 s | *"My kid taught a computer their face. With a browser tab."* | Close-up: a small hand tapping Start Mission. |
| 3–10 s | *"No photos, no cloud, no login. Just a webcam and curiosity."* | Camera turns on. Face box snaps onto the kid's face. |
| 10–20 s | *"Click Teach. The computer remembers the numbers."* | Kid clicks Teach My Face. Watch the XP counter bump. |
| 20–30 s | *"Click Unlock. Match!"* | Kid clicks Unlock → MATCH ✅. They grin. |
| 30–40 s | *"We plug in a micro:bit. It shows a tick when it's really them."* | Connect the board. Unlock → micro:bit shows ✓. |
| 40–50 s | *"Mom tries. No match. The computer can tell."* | Parent leans in. Unlock → NO MATCH ❌. Kid laughs. |
| 50–60 s | *"Full kit on Etsy. Link below."* | Kid holding the micro:bit + a sticker sheet. Smile. Freeze. |

---

## During-recording tactics

- **One scene per phase.** Do not cut every 2 s — it feels frantic.
- **Switch scenes on words**, not mid-sentence.
- **Pause 1 second on the MATCH / NO MATCH verdict** — visual emphasis.
- **Look at the camera lens**, not the screen, during all CTAs.
- **Smile for the final 3 seconds**. The loop frame matters.
- **Watch the clock** — if you pass 55 s, re-cut. Etsy compresses aggressively.

---

## Common mistakes to avoid

| ❌ Don't | ✅ Do |
|---|---|
| Start with "Hi, I'm…" + 10 s intro | First 3 s = the face box snapping onto your face |
| Film landscape (16:9) | 9:16 portrait — Etsy autoplays on mobile |
| Demo on Safari / iPhone | Show Chrome/Edge only. iOS users will buy and refund |
| Save or flash an actual photo of the buyer's face | Only show the numeric descriptor in DevTools — reinforce privacy |
| Skip captions | Burn in "Teach", "Unlock", "MATCH", "NO MATCH" — the feed is muted |
| Whisper | Speak 15 % louder and 10 % slower than normal conversation |
| Forget the CTA | "Link below" in the last 5 s, every single time |
| End mid-sentence | Land your closing line. Then hold 2 seconds of silence |
| Cluttered desk | Clean area in frame — even a tiny frame shows clutter |

---

## After you press Stop

1. Watch the playback **once**, eyes off the script. Does it land?
2. If >60 s → trim with a simple editor (iMovie, CapCut, DaVinci). Aim for 55 s.
3. Burn in captions if you haven't already. Keep them centered below the subject.
4. First frame — set it to a strong, still visual (the face-scanner hero, or the logo). This is your cover.
5. Export MP4 / H.264, under 100 MB.
6. Upload to the Etsy listing. Verify autoplay. Check on a phone with sound off.

---

## Etsy-specific upload tips

- Etsy listing videos appear at the top as an **autoplaying preview tile**. First frame is the cover — make it visually clean.
- Use the listing **title** to echo the video's first words. If you say *"Teach a browser your face in 60 seconds"*, the listing title leads with *"Face Quest — In-Browser Face Recognition Lab…"*.
- Add the captions text into the listing **description** — searchable, helps SEO.
- Tag the listing with words you actually said in the video.
- Launch day: share code `QUESTLAUNCH` → single-user drops to $8 for 48 h.

---

## The 5-take rule

**Never publish your first take.** Plan to do 3–5:

1. **Take 1** — read the script literally. Find the awkward bits.
2. **Take 2** — fix the awkward bits. Less reading, more talking.
3. **Take 3** — drop the script. Talk to a friend, not to a camera.
4. **Take 4** — slow down 10 %. Add one deliberate pause.
5. **Take 5** — your keeper.

---

## Quick-reference cheat card

```
PRE     Camera clean · Chrome served via http.server · Reset face · Threshold 0.60 · 9:16 phone
LAUNCH  Record → first words land in the first 3 seconds
DURING  Start → Teach → Unlock match · friend → no match · micro:bit ✓
AFTER   Stop → trim to 55 s → burn captions → first frame = thumbnail
UPLOAD  Etsy listing → upload MP4 → echo first words in listing title · QUESTLAUNCH promo
```

---

## Listing-page copy snippets

**Title (140 chars max):**
```
Face Quest — In-Browser Face Recognition Lab for Kids & Classrooms · Webcam + micro:bit · Learn Spot Play · No Cloud · Chrome / Edge
```

**160-char short description:**
```
In-browser face recognition lab for kids & classrooms. Three AI models run locally — no photos saved. Webcam + optional BBC micro:bit V2. Chrome / Edge.
```

**13 Etsy tags:**
```
face recognition, AI for kids, STEM, education, micro:bit, webcam project, coding club, teacher resource, classroom, home school, privacy first, browser app, makerspace
```

**Materials:**
```
HTML5, JavaScript, face-api.js, Web Bluetooth, IndexedDB, PWA, MakeCode, TypeScript
```

**SEO keywords:**
```
in-browser face recognition · no photos saved · privacy-first AI · offline-capable · web bluetooth micro:bit · AI literacy lesson · kids coding · face-api.js classroom
```

**Price tiers:**

| Tier | Who | Price (USD) |
|---|---|---|
| Launch / early-bird | First 100 buyers | `$14.99` |
| Standard single-user | One teacher / family / maker | `$19.99` |
| Bundle (all extras) | Single-user + printables + lesson pack | `$34.99` |
| Tripwire | Quick-Start card only | `$5` |
| Site / Classroom | One school, unlimited students | `$249` |
| District / OEM | Multiple sites — DM through order | `$599+` |

Launch promo: share `QUESTLAUNCH` on launch day — single-user drops to `$8` for 48 hours.

---

## 7-image listing order

1. **Hero** — Face Quest scanner with the face box + landmarks on the seller's face, "🧠 Teach My Face" button glowing. Title overlay in Orbitron.
2. **Teach / Unlock flow** — triptych: Start → Teach → Unlock with MATCH ✅.
3. **Threshold close-up** — slider at 0.60 with the Quest Log showing "MATCH distance 0.42".
4. **Robot Buddy** — real micro:bit V2 showing ✓ next to a laptop running Face Quest.
5. **Privacy promise** — 3-up card: "No photos" · "No internet" · "No account".
6. **Printables bundle** — flat-lay: quick-start card, controls cheat sheet, A3 poster, sticker sheet.
7. **License card** — "Single-user license · Lifetime updates · Chrome / Edge · Webcam required" on a dark gradient.

---

*Made for Face Quest v1.0.0 — print this on A4, laminate, keep next to the shoot rig.*
