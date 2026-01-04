# 🧠😄 Face Quest  
### Face Recognition Game with Camera & micro:bit

Welcome to **Face Quest**!  
Face Quest is a fun and educational project that helps kids and beginners learn how **Artificial Intelligence (AI)** works using a **camera**, a **web browser**, and a **micro:bit**.

Everything runs **locally on your computer**, which makes it safe and privacy-friendly 👍

---

## 👦👧 Who is this project for?
- Kids & students 👧👦  
- Beginners in programming 💻  
- Curious minds who want to learn AI 🤖  

No advanced math, no difficult words, just learning by playing 😄

---

## 🎯 What does Face Quest do?

Face Quest can:

✅ Turn on your camera  
✅ Find a face on the screen  
✅ Learn a face (**Enroll**)  
✅ Check if the same face comes back (**Verify**)  
✅ Send the result to a **micro:bit** using Bluetooth  
✅ Work **offline** (no internet needed after setup)

---

## 📸 How does it work? (Very simple)

1. The camera sees your face 👀  
2. The computer finds where the face is 🙂  
3. The face is turned into secret numbers 🔢  
4. The numbers are saved (Enroll)  
5. Later, numbers are compared (Verify)  
6. If they match → ✅ YES  
7. If not → ❌ NO  

This is how **face recognition** works in real life 🤖

---

## 🧩 Buttons explained

| Button | What it does |
|------|-------------|
| ▶️ Start | Turns on the camera |
| 🧾 Enroll | Saves your face |
| ✅ Verify | Checks if it’s you |
| 🧹 Clear | Deletes saved face |
| 🔗 Connect | Connects to micro:bit |

---

## 🧠 AI Models used (simple explanation)

Face Quest uses **3 small AI brains**:

1. 👤 **Face Detector**  
   Finds where the face is

2. 📍 **Face Landmarks**  
   Finds eyes, nose, and mouth

3. 🧬 **Face Recognition**  
   Turns your face into numbers

You don’t need to understand the math to use them 😊

---

## 📁 Project structure

```
Face-Quest/
├── index.html        → The web page
├── app.js            → Main app logic
├── face-api.min.js   → AI library
├── ble_microbit.js   → micro:bit Bluetooth
├── styles.css        → Design & colors
├── models/           → AI models (VERY IMPORTANT)
└── README.md
```

⚠️ If the **models/** folder is missing, the app will not work.

---

## ▶️ How to run the project

### Step 1: Open a terminal
Go to the project folder.

### Step 2: Start a local server
```bash
python3 -m http.server 8012
```

### Step 3: Open the browser
Go to:
```
http://localhost:8012
```

Allow camera access when asked 📸

---

## 🔵 micro:bit (optional but fun!)

If you connect a **micro:bit**:

- The app sends **MATCH** or **NO**
- The micro:bit can:
  - Show LEDs 💡
  - Display icons 😀
  - Play sounds 🎵

This makes Face Quest feel like a real game 🎮

---

## 🛡️ Safety & Privacy

✅ No photos are saved  
✅ No face data sent to the internet  
✅ No accounts needed  
✅ Safe for kids  

Everything stays on **your computer** 👍

---

## 🌟 What can you learn?

- How AI sees faces  
- How cameras work in browsers  
- How Bluetooth works  
- How real security systems work  
- How to build fun tech projects 🚀  

---

## 🔗 Useful Links

<p align="center">
  <a href="https://github.com/abourdim/face-quest" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-Face%20Quest-black?style=for-the-badge&logo=github">
  </a>
</p>

<p align="center">
  <a href="https://makecode.microbit.org/_dLef9q7KYUgq" target="_blank">
    <img src="https://img.shields.io/badge/micro:bit-MakeCode-blue?style=for-the-badge&logo=microbit">
  </a>
</p>

---

## ❤️ Have fun!

Face Quest is all about **learning by playing** 🎉  
Try it, change it, and explore AI safely! 😄
