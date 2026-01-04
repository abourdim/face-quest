🧠😄 Face Quest
Face Recognition Game with Camera & micro

Welcome to Face Quest!
This project uses a camera and artificial intelligence (AI) to recognize a face.
It can also talk to a micro using Bluetooth 🔵.

This project is made to be fun, educational, and safe 🎉

👦👧 Who is this for?

Kids & students

Beginners in programming

Anyone curious about AI, faces, and technology

No advanced math needed 😊

🎯 What does Face Quest do?

Face Quest can:

✅ Turn on your camera
✅ Detect a face
✅ Learn a face (Enroll)
✅ Check if it’s the same face (Verify)
✅ Send the result to a micro
✅ Work offline in your browser

👉 Everything runs on your computer, not on the internet!

📸 How it works (simple explanation)

The camera sees your face 👀

The computer finds your face 🙂

The computer turns your face into numbers 🔢

It remembers those numbers

Later, it compares faces

If they match → ✅ YES

If not → ❌ NO

This is called Face Recognition 🤖

🧩 Buttons explained
Button	What it does
▶️ Start	Turns on the camera
🧾 Enroll	Saves your face
✅ Verify	Checks if it’s you
🧹 Clear	Deletes saved face
🔗 Connect	Connects to micro
🧠 AI Models used (don’t worry 😄)

The app uses 3 small AI brains:

👤 Face Detector
→ Finds where the face is

📍 Face Landmarks
→ Finds eyes, nose, mouth

🧬 Face Recognition
→ Turns your face into numbers

You don’t need to understand the math to use it 👍

📁 Project files (important!)
Face-Quest/
│
├── index.html        → The web page
├── app.js            → Main brain of the app
├── face-api.min.js   → AI library
├── ble_microbit.js   → micro:bit Bluetooth
├── styles.css        → Colors & design
│
├── models/           → AI models (VERY IMPORTANT)
│   ├── tiny_face_detector_model-weights_manifest.json
│   ├── tiny_face_detector_model-shard1
│   ├── face_landmark_68_model-weights_manifest.json
│   ├── face_landmark_68_model-shard1
│   ├── face_recognition_model-weights_manifest.json
│   ├── face_recognition_model-shard1
│   └── face_recognition_model-shard2
│
└── README.md

⚠️ If the models folder is missing, the app will NOT work.

▶️ How to run the project
Step 1: Open a terminal

Go to the project folder.

Step 2: Start a local server

Example:

python3 -m http.server 8012
Step 3: Open the browser

Go to:

http://localhost:8012

🎉 That’s it!

🔵 micro (optional but cool!)

If you connect a micro:

The app sends MATCH or NO

The micro can:

Show icons

Turn on LEDs

Make sounds 🎵

This makes Face Quest feel like a real game!

🛡️ Safety & Privacy

✅ No photos are saved
✅ No internet needed
✅ No data sent to servers
✅ Everything stays on your computer

Safe for kids 👍

🌟 What you can learn

How AI sees faces

How browsers use cameras

How Bluetooth works

How real biometric systems work

How to build fun tech projects 🚀

❤️ Have fun!

Face Quest is about learning by playing.
Try changing the code, test with friends, and explore AI safely!

Happy coding 😄👨‍💻👩‍💻
