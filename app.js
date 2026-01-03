// app.js — Face Verify (1:1) + micro:bit BLE + verbose color-coded logs
// Requires:
//  - face-api.min.js next to index.html
//  - models in ./models (folder next to index.html)

const MODELS_URL = "./models";

// Defaults (can be tuned in the UI)
const DEFAULT_DETECTOR = "ssd"; // "ssd" (more accurate) | "tiny" (faster)
const DEFAULT_DISTANCE = "euclidean"; // euclidean is what face-api FaceMatcher uses
const DEFAULT_THRESHOLD = 0.60; // starting point for euclidean distance

// Tunable settings (bound to UI)
const settings = {
  detector: DEFAULT_DETECTOR,
  distance: DEFAULT_DISTANCE,
  threshold: DEFAULT_THRESHOLD,
  verifyFrames: 12,
  enrollSamplesTarget: 18,
  minDetScore: 0.60,
  minFacePx: 140,
  minBlurVar: 55, // higher = sharper; depends on camera
};

// DOM
const video = document.getElementById("video");
const btnStart = document.getElementById("btnStart");
const btnEnroll = document.getElementById("btnEnroll");
const btnVerify = document.getElementById("btnVerify");
const btnClear = document.getElementById("btnClear");

// Speech UI (Web Speech API)
const btnSpeech = document.getElementById("btnSpeech");
const btnVoice = document.getElementById("btnVoice");

// Speech settings (stored locally)
const SPEECH_KEY = "facequest_speech_enabled";
let speechEnabled = false;

// Settings UI
const selDetector = document.getElementById("selDetector");
const selDistance = document.getElementById("selDistance");
const rngThreshold = document.getElementById("rngThreshold");
const txtThreshold = document.getElementById("txtThreshold");
const rngVerifyFrames = document.getElementById("rngVerifyFrames");
const txtVerifyFrames = document.getElementById("txtVerifyFrames");

const statusEl = document.getElementById("status");
const statusDot = document.getElementById("statusDot");
const statusPillText = document.getElementById("statusPillText");
const topChipText = document.getElementById("topChipText");

const logEl = document.getElementById("log");
const btnCopyLog = document.getElementById("btnCopyLog");
const btnClearLog = document.getElementById("btnClearLog");
const btnClearCache = document.getElementById("btnClearCache");

// Kid-friendly gamification: XP counter (stored locally)
const xpEl = document.getElementById("xpValue");
const XP_KEY = "facequest_xp";
let xp = 0;

function loadXp() {
  const raw = localStorage.getItem(XP_KEY);
  const n = Number(raw);
  xp = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  renderXp();
}

function saveXp() {
  try { localStorage.setItem(XP_KEY, String(xp)); } catch {}
}

function renderXp() {
  if (xpEl) xpEl.textContent = String(xp);
}

// ---------------- Speech (Text-to-Speech + optional Voice Commands) ------
function supportsTTS() {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

function loadSpeechSetting() {
  const raw = localStorage.getItem(SPEECH_KEY);
  speechEnabled = raw === "1";
  renderSpeechButton();
}

function saveSpeechSetting() {
  try { localStorage.setItem(SPEECH_KEY, speechEnabled ? "1" : "0"); } catch {}
}

function renderSpeechButton() {
  if (!btnSpeech) return;
  const ok = supportsTTS();
  btnSpeech.disabled = !ok;
  btnSpeech.textContent = ok
    ? `🔊 Speech: ${speechEnabled ? "On" : "Off"}`
    : "🔊 Speech: Unsupported";
}

function speak(text, { interrupt = true } = {}) {
  if (!speechEnabled || !supportsTTS()) return;
  const msg = String(text || "").trim();
  if (!msg) return;

  try {
    if (interrupt) window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(msg);
    u.rate = 1.02; // slightly snappy for kids; safe default
    u.pitch = 1.0;
    u.volume = 1.0;
    window.speechSynthesis.speak(u);
  } catch (e) {
    // Don’t break the app if the browser blocks speech.
    logLine("warn", `Speech blocked: ${e?.message || e}`, "SPEECH");
  }
}

function supportsVoiceCommands() {
  return typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
}

async function startVoiceCommandOnce() {
  if (!supportsVoiceCommands()) {
    logLine("warn", "Voice commands not supported in this browser", "SPEECH");
    speak("Voice commands are not supported in this browser.");
    return;
  }

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SR();
  rec.lang = navigator.language || "en-US";
  rec.interimResults = false;
  rec.maxAlternatives = 1;

  setStatus("Listening… say: Start / Teach / Unlock / Reset", "info");
  speak("Listening. Say start, teach, unlock, or reset.");

  await new Promise((resolve) => {
    rec.onresult = async (ev) => {
      const t = (ev.results?.[0]?.[0]?.transcript || "").toLowerCase();
      logLine("info", `Heard: ${t}`, "SPEECH");

      // Simple fuzzy commands
      const has = (w) => t.includes(w);
      try {
        if (has("start")) {
          speak("Starting mission.");
          await loadModels();
          await startCamera();
        } else if (has("teach") || has("enroll") || has("train")) {
          speak("Teaching your face.");
          await enroll();
        } else if (has("unlock") || has("verify") || has("open")) {
          speak("Scanning to unlock.");
          await verify();
        } else if (has("reset") || has("clear")) {
          speak("Resetting face.");
          await clearEnrolled();
        } else {
          speak("I did not catch a command. Try start, teach, unlock, or reset.");
          setStatus("Try: Start / Teach / Unlock / Reset", "warn");
        }
      } finally {
        resolve();
      }
    };
    rec.onerror = (e) => {
      logLine("warn", `Voice error: ${e?.error || "unknown"}`, "SPEECH");
      setStatus("Voice error — try again.", "warn");
      speak("Voice error. Try again.");
      resolve();
    };
    rec.onend = () => resolve();

    try { rec.start(); } catch { resolve(); }
  });
}

function addXp(amount, reason = "") {
  const a = Math.max(0, Math.floor(Number(amount) || 0));
  if (!a) return;
  xp += a;
  saveXp();
  renderXp();
  logLine("success", `+${a} XP${reason ? ` — ${reason}` : ""}!`, "XP");
}

// micro:bit UI
const mbConnDot = document.getElementById("mbConnDot");
const mbConnText = document.getElementById("mbConnText");
const mbConnectBtn = document.getElementById("mbConnectBtn");
const mbDisconnectBtn = document.getElementById("mbDisconnectBtn");
const mbTestBtn = document.getElementById("mbTestBtn");

// State
let stream = null;
let modelsLoaded = false;

// Offscreen canvas for quality checks
const qcCanvas = document.createElement("canvas");
const qcCtx = qcCanvas.getContext("2d", { willReadFrequently: true });

// ---------------- Logging (timestamp first + module tag + color codes) -----
function ts() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function logLine(level, msg, module = "APP") {
  if (!logEl) return;

  const line = document.createElement("div");
  line.className = `log-line ${level}`;

  const prefix = document.createElement("span");
  prefix.className = "log-prefix";
  prefix.textContent = `[${ts()}] [${module}] `;

  const text = document.createElement("span");
  text.className = "log-text";
  text.textContent = msg;

  line.appendChild(prefix);
  line.appendChild(text);
  logEl.appendChild(line);

  // limit
  const MAX_LINES = 250;
  while (logEl.children.length > MAX_LINES) {
    logEl.removeChild(logEl.firstChild);
  }

  // autoscroll
  logEl.scrollTop = logEl.scrollHeight;
}

function setUIState(kind, text) {
  if (topChipText) topChipText.textContent = text;

  if (statusDot) {
    statusDot.classList.remove("ok", "warn", "bad", "idle", "loading");
    statusDot.classList.add(kind);
  }

  if (statusPillText) statusPillText.textContent = text;
}

function setStatus(text, kind = "idle") {
  if (statusEl) statusEl.textContent = text;
  setUIState(kind, text);
}

/**
 * ✅ Restore micro:bit logs in RESULT panel
 * ble_microbit.js emits window.mbOnLog(text, kind) and window.mbOnConnectionChange(connected)
 * We map them to our logLine() format and use module tag "MB"
 */
function installMicrobitLogBridge() {
  const kindToLevel = (kind) => {
    const k = String(kind || "").toLowerCase();
    if (k === "success") return "success";
    if (k === "error") return "error";
    if (k === "warn" || k === "warning") return "warn";
    // For tx/rx we keep them as info but prefix emojis to distinguish
    if (k === "tx" || k === "rx") return "info";
    return "info";
  };

  window.mbOnLog = (text, kind) => {
    const k = String(kind || "").toLowerCase();
    const level = kindToLevel(k);
    let msg = String(text ?? "");

    if (k === "tx") msg = `📤 ${msg}`;
    if (k === "rx") msg = `📥 ${msg}`;

    logLine(level, msg, "MB");
  };

  window.mbOnConnectionChange = (connected) => {
    updateMicrobitUI();
    logLine(connected ? "success" : "warn", connected ? "BLE connected" : "BLE disconnected", "MB");
    speak(connected ? "Robot buddy connected." : "Robot buddy disconnected.");
  };
}

// Also expose a generic logger if you want to call it from anywhere
window.appLog = (level, msg, module = "APP") => logLine(level, msg, module);

// ---------------- Persistence (IndexedDB: 1 key = descriptor) -------------
const DB_NAME = "face_verify_db";
const STORE = "enrollment";
const KEY = "enrolled";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(value, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGet() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(KEY);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function idbDel() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ---------------- Distances ----------------
function cosineDistance(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i]; const y = b[i];
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  if (!denom) return 1;
  return 1 - (dot / denom);
}

function euclideanDistance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

function distanceBetween(a, b) {
  return settings.distance === "cosine" ? cosineDistance(a, b) : euclideanDistance(a, b);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function meanDescriptor(descs) {
  const out = new Float32Array(descs[0].length);
  for (const d of descs) {
    for (let i = 0; i < d.length; i++) out[i] += d[i];
  }
  for (let i = 0; i < out.length; i++) out[i] /= descs.length;
  return out;
}

function median(arr) {
  const a = [...arr].sort((x, y) => x - y);
  return a[Math.floor(a.length / 2)];
}

// ---------------- face-api: load + detect ----------------
async function loadModels() {
  if (modelsLoaded) return;

  if (typeof faceapi === "undefined") {
    throw new Error("faceapi is not defined (face-api.min.js did not load)");
  }

  logLine("info", "Loading face-api models from " + MODELS_URL, "FACE");
  setUIState("loading", "Loading");

  // Load both detectors so you can switch at runtime (speed vs accuracy).
  await faceapi.nets.ssdMobilenetv1.loadFromUri(MODELS_URL);
  logLine("success", "Loaded: ssdMobilenetv1", "FACE");

  await faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL);
  logLine("success", "Loaded: tinyFaceDetector", "FACE");

  await faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_URL);
  logLine("success", "Loaded: faceLandmark68Net", "FACE");

  await faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_URL);
  logLine("success", "Loaded: faceRecognitionNet", "FACE");

  modelsLoaded = true;
  setStatus("Brain modules loaded! 🤓 Camera ready.", "success");
}

async function detectFaceOnce() {
  // Returns full detection object: { detection, landmarks, descriptor }
  if (!modelsLoaded) await loadModels();
  if (!stream) await startCamera();

  const opts = (settings.detector === "tiny")
    ? new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 })
    : new faceapi.SsdMobilenetv1Options({ minConfidence: settings.minDetScore });

  const det = await faceapi
    .detectSingleFace(video, opts)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!det) {
    logLine("warn", "No face detected", "FACE");
    return null;
  }

  // Quality gates: detection confidence + face size + blur
  const score = det.detection?.score ?? 0;
  const box = det.detection?.box;
  if (!box) return null;

  if (score < settings.minDetScore) {
    logLine("warn", `Low detection score (${score.toFixed(2)} < ${settings.minDetScore})`, "FACE");
    return null;
  }

  if (box.width < settings.minFacePx || box.height < settings.minFacePx) {
    logLine("warn", `Face too small (${Math.round(box.width)}px). Move closer.`, "FACE");
    return null;
  }

  const blurVar = estimateBlurVariance(box);
  if (blurVar !== null && blurVar < settings.minBlurVar) {
    logLine("warn", `Image too blurry (blurVar=${blurVar.toFixed(0)} < ${settings.minBlurVar})`, "FACE");
    return null;
  }

  return det;
}

function estimateBlurVariance(box) {
  // Variance-of-Laplacian blur metric on a downsampled face crop.
  if (!qcCtx) return null;

  const vw = video.videoWidth || video.width;
  const vh = video.videoHeight || video.height;
  if (!vw || !vh) return null;

  // Clamp crop to video bounds
  let x = Math.max(0, Math.floor(box.x));
  let y = Math.max(0, Math.floor(box.y));
  let w = Math.min(vw - x, Math.floor(box.width));
  let h = Math.min(vh - y, Math.floor(box.height));
  if (w <= 0 || h <= 0) return null;

  // Downsample for speed
  const target = 96;
  const scale = target / Math.max(w, h);
  const dw = Math.max(24, Math.floor(w * scale));
  const dh = Math.max(24, Math.floor(h * scale));

  qcCanvas.width = dw;
  qcCanvas.height = dh;
  qcCtx.drawImage(video, x, y, w, h, 0, 0, dw, dh);

  const img = qcCtx.getImageData(0, 0, dw, dh).data;

  // grayscale
  const gray = new Float32Array(dw * dh);
  for (let i = 0, p = 0; i < img.length; i += 4, p++) {
    gray[p] = 0.2126 * img[i] + 0.7152 * img[i + 1] + 0.0722 * img[i + 2];
  }

  // Laplacian (4-neighbor)
  const lap = new Float32Array(dw * dh);
  for (let yy = 1; yy < dh - 1; yy++) {
    for (let xx = 1; xx < dw - 1; xx++) {
      const i = yy * dw + xx;
      lap[i] = (4 * gray[i]) - gray[i - 1] - gray[i + 1] - gray[i - dw] - gray[i + dw];
    }
  }

  // variance
  let mean = 0, n = 0;
  for (let i = 0; i < lap.length; i++) {
    const v = lap[i];
    if (!Number.isFinite(v)) continue;
    mean += v; n++;
  }
  if (!n) return null;
  mean /= n;

  let varSum = 0;
  for (let i = 0; i < lap.length; i++) {
    const v = lap[i];
    if (!Number.isFinite(v)) continue;
    const d = v - mean;
    varSum += d * d;
  }
  return varSum / n;
}

// ---------------- Camera ----------------
async function startCamera() {
  logLine("info", "Requesting camera…", "APP");
  setStatus("Powering up camera…", "loading");

  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" },
    audio: false
  });

  video.srcObject = stream;
  await new Promise(r => video.onloadedmetadata = r);
  await video.play();

  logLine("success", "Camera started", "APP");
  setStatus("Camera ready! Teach your face to begin.", "success");
  speak("Camera ready. Teach your face to begin.");
  btnEnroll.disabled = false;
}

// ---------------- Enroll + Verify ----------------
async function enroll() {
  setStatus("Teaching mode… Hold still like a statue 🗿", "info");
  speak("Teaching mode. Hold still.");
  logLine("info", "Enroll requested", "FACE");

  const target = settings.enrollSamplesTarget;
  const maxAttempts = target * 3;
  const samples = [];

  for (let i = 0, tries = 0; i < target && tries < maxAttempts; tries++) {
    const det = await detectFaceOnce();
    if (det?.descriptor) {
      samples.push(det.descriptor);
      i++;
      logLine("info", `Enroll sample ${i}/${target} ok`, "FACE");
    }
    await sleep(90);
  }

  if (samples.length < Math.max(6, Math.floor(target * 0.35))) {
    setStatus("Hmm… not enough clear frames. Add light + try again!", "error");
    logLine("error", `Enroll: only ${samples.length}/${target} usable samples`, "FACE");
    speak("Not enough clear frames. Add light and try again.", { interrupt: true });
    return;
  }

  const avg = meanDescriptor(samples);
  await idbSet({
    version: 2,
    createdAt: Date.now(),
    detector: settings.detector,
    distance: settings.distance,
    descriptor: Array.from(avg),
    n: samples.length
  });

  btnVerify.disabled = false;
  btnClear.disabled = false;

  setStatus(`Face learned! ✔ (${samples.length} samples)`, "success");
  logLine("success", `Enrollment saved (${samples.length} samples averaged)`, "FACE");
  speak("Face learned. You're ready to unlock.");

  // ⭐ Reward XP for completing an enrollment mission
  addXp(20, "Face trained");

  if (window.mbIsConnected?.()) {
    await window.mbSendLine?.("ENROLLED");
  }
}

async function verify() {
  const stored = await idbGet();
  if (!stored) {
    setStatus("First, teach your face (Enroll).", "error");
    logLine("error", "Verify requested but no enrollment exists", "FACE");
    speak("First, teach your face.", { interrupt: true });
    return;
  }

  const enrolledDesc = new Float32Array(stored.descriptor ?? stored);
  const thr = settings.threshold;
  const N = settings.verifyFrames;

  setStatus("Scanning… Hold still 😄", "info");
  speak("Scanning. Hold still.");
  logLine("info", "Verify requested", "FACE");

  const dists = [];
  const maxAttempts = N * 3;

  for (let i = 0, tries = 0; i < N && tries < maxAttempts; tries++) {
    const det = await detectFaceOnce();
    if (det?.descriptor) {
      const dist = distanceBetween(det.descriptor, enrolledDesc);
      dists.push(dist);
      i++;
      logLine("info", `Frame ${i}/${N}: distance=${dist.toFixed(3)}`, "FACE");
    }
    await sleep(70);
  }

  if (dists.length < Math.max(5, Math.floor(N * 0.4))) {
    setStatus("Scan too wiggly — move closer + hold still.", "error");
    logLine("error", `Verify: only ${dists.length}/${N} usable frames`, "FACE");
    speak("Scan too wiggly. Move closer and hold still.", { interrupt: true });
    return;
  }

  const med = median(dists);
  const passCount = dists.filter(x => x <= thr).length;
  const passRate = passCount / dists.length;

  logLine(
    "info",
    `${settings.distance} median=${med.toFixed(3)} threshold=${thr.toFixed(2)} passRate=${Math.round(passRate * 100)}%`,
    "FACE"
  );

  const isMatch = (med <= thr) && (passRate >= 0.65);

  if (isMatch) {
    setStatus(`UNLOCKED! ✅ (confidence ${Math.round(passRate * 100)}%)`, "success");
    logLine("success", `MATCH distance(median)=${med.toFixed(3)}`, "APP");
    speak("Unlocked.", { interrupt: true });
    addXp(10, "Door unlocked");
    if (window.mbIsConnected?.()) await window.mbSendLine?.("MATCH");
  } else {
    setStatus(`Nope — try again ❌ (confidence ${Math.round(passRate * 100)}%)`, "error");
    logLine("error", `NO MATCH distance(median)=${med.toFixed(3)}`, "APP");
    speak("No match. Try again.", { interrupt: true });
    if (window.mbIsConnected?.()) await window.mbSendLine?.("NO");
  }
}

async function clearEnrolled() {
  await idbDel();
  btnVerify.disabled = true;
  btnClear.disabled = true;
  setStatus("Face reset complete.", "idle");
  logLine("info", "Enrollment cleared", "APP");
  speak("Face reset complete.");
  if (window.mbIsConnected?.()) await window.mbSendLine?.("CLEARED");
}

// ---------------- Settings UI bindings ----------------
function clampThresholdForDistance() {
  if (!rngThreshold) return;
  if (settings.distance === "euclidean") {
    rngThreshold.min = "0.30";
    rngThreshold.max = "1.20";
    rngThreshold.step = "0.01";
  } else {
    rngThreshold.min = "0.05";
    rngThreshold.max = "0.80";
    rngThreshold.step = "0.01";
  }
}

function syncSettingsUI() {
  if (selDetector) selDetector.value = settings.detector;
  if (selDistance) selDistance.value = settings.distance;
  if (rngThreshold) {
    rngThreshold.value = String(settings.threshold);
    if (txtThreshold) txtThreshold.textContent = settings.threshold.toFixed(2);
  }
  if (rngVerifyFrames) {
    rngVerifyFrames.value = String(settings.verifyFrames);
    if (txtVerifyFrames) txtVerifyFrames.textContent = String(settings.verifyFrames);
  }
}

if (selDetector) {
  selDetector.addEventListener("change", () => {
    settings.detector = selDetector.value;
    logLine("info", `Detector set to ${settings.detector}`, "APP");
  });
}

if (selDistance) {
  selDistance.addEventListener("change", () => {
    settings.distance = selDistance.value;
    // sane default threshold per metric
    settings.threshold = (settings.distance === "euclidean") ? 0.60 : 0.45;
    clampThresholdForDistance();
    syncSettingsUI();
    logLine("info", `Distance metric set to ${settings.distance}`, "APP");
  });
}

if (rngThreshold) {
  rngThreshold.addEventListener("input", () => {
    settings.threshold = Number(rngThreshold.value);
    if (txtThreshold) txtThreshold.textContent = settings.threshold.toFixed(2);
  });
}

if (rngVerifyFrames) {
  rngVerifyFrames.addEventListener("input", () => {
    settings.verifyFrames = Number(rngVerifyFrames.value);
    if (txtVerifyFrames) txtVerifyFrames.textContent = String(settings.verifyFrames);
  });
}

clampThresholdForDistance();
syncSettingsUI();

// ---------------- UI events ----------------
btnStart?.addEventListener("click", async () => {
  try {
    await loadModels();
    await startCamera();
  } catch (e) {
    console.error(e);
    setStatus("Start failed: " + (e?.message || e), "bad");
    logLine("error", "Start failed: " + (e?.message || e), "APP");
  }
});

btnEnroll?.addEventListener("click", async () => {
  try {
    await enroll();
  } catch (e) {
    console.error(e);
    setStatus("Enroll failed: " + (e?.message || e), "bad");
    logLine("error", "Enroll failed: " + (e?.message || e), "APP");
  }
});

btnVerify?.addEventListener("click", async () => {
  try {
    await verify();
  } catch (e) {
    console.error(e);
    setStatus("Verify failed: " + (e?.message || e), "bad");
    logLine("error", "Verify failed: " + (e?.message || e), "APP");
  }
});

btnClear?.addEventListener("click", async () => {
  try {
    await clearEnrolled();
  } catch (e) {
    console.error(e);
    setStatus("Clear failed: " + (e?.message || e), "bad");
    logLine("error", "Clear failed: " + (e?.message || e), "APP");
  }
});

// Speech UI
btnSpeech?.addEventListener("click", () => {
  speechEnabled = !speechEnabled;
  saveSpeechSetting();
  renderSpeechButton();
  logLine("info", `Speech ${speechEnabled ? "enabled" : "disabled"}`, "SPEECH");
  if (speechEnabled) speak("Speech on.");
});

btnVoice?.addEventListener("click", async () => {
  await startVoiceCommandOnce();
});

btnCopyLog?.addEventListener("click", async () => {
  const txt = logEl?.innerText || "";
  try {
    await navigator.clipboard.writeText(txt);
    logLine("success", "Logs copied to clipboard", "APP");
  } catch {
    logLine("warn", "Clipboard blocked; select & copy manually", "APP");
  }
});

btnClearLog?.addEventListener("click", () => {
  if (logEl) logEl.innerHTML = "";
  logLine("info", "Log cleared", "APP");
});

btnClearCache?.addEventListener("click", async () => {
  if (!("caches" in window)) {
    logLine("warn", "Cache API not available", "APP");
    return;
  }
  const keys = await caches.keys();
  await Promise.all(keys.map(k => caches.delete(k)));
  logLine("success", "Cache cleared. Reload to refetch assets.", "APP");
  logLine("info", "XP stays (stored separately).", "XP");
});

// micro:bit BLE events (ble_microbit.js exposes mbConnect/mbDisconnect/mbSendLine, etc.)
function updateMicrobitUI() {
  const ok = window.mbIsConnected?.();
  if (mbConnDot) {
    mbConnDot.classList.remove("ok", "bad");
    mbConnDot.classList.add(ok ? "ok" : "bad");
  }
  if (mbConnText) mbConnText.textContent = ok ? "CONNECTED" : "DISCONNECTED";
}

mbConnectBtn?.addEventListener("click", async () => {
  logLine("info", "micro:bit connect requested", "APP");
  try {
    await window.mbConnect?.();
    updateMicrobitUI();
  } catch (e) {
    updateMicrobitUI();
    logLine("error", "micro:bit connect failed: " + (e?.message || e), "APP");
  }
});

mbDisconnectBtn?.addEventListener("click", async () => {
  logLine("info", "micro:bit disconnect requested", "APP");
  try {
    await window.mbDisconnect?.();
    updateMicrobitUI();
  } catch (e) {
    updateMicrobitUI();
    logLine("error", "micro:bit disconnect failed: " + (e?.message || e), "APP");
  }
});

mbTestBtn?.addEventListener("click", async () => {
  logLine("info", "Send TEST to micro:bit", "APP");
  try {
    await window.mbSendLine?.("TEST");
  } catch (e) {
    logLine("error", "TEST send failed: " + (e?.message || e), "APP");
  }
});

// Initialize
(async function init() {
  // Load XP counter
  loadXp();

  // Load speech toggle state
  loadSpeechSetting();

  setStatus("Ready for a mission. Click Start Mission!", "idle");

  // ✅ Install BLE->UI log bridge
  installMicrobitLogBridge();

  // See if enrollment exists
  try {
    const enrolled = await idbGet();
    if (enrolled) {
      btnVerify.disabled = false;
      btnClear.disabled = false;
      logLine("info", "Found existing enrollment in local storage", "APP");
    }
  } catch {}

  // micro:bit UI
  updateMicrobitUI();
})();
