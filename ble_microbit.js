// ble_microbit.js — micro:bit BLE UART helper (AUTO: micro:bit UART or Nordic UART)
// Supports:
//  A) MakeCode micro:bit UART service (UUID e95d...)
//  B) Nordic UART Service (NUS) (UUID 6e40...) — used by some firmwares/apps
//
// Globals: mbConnect(), mbDisconnect(), mbSendLine(line), mbIsConnected()
// Hooks set by app.js: window.mbOnLog(text, kind), window.mbOnConnectionChange(connected)

const MB_UART_SERVICE_UUID = "e95d0753-251d-470a-a062-fa1922dfa9a8";
const MB_UART_RX_UUID      = "e95d93ee-251d-470a-a062-fa1922dfa9a8"; // write
const MB_UART_TX_UUID      = "e95d9250-251d-470a-a062-fa1922dfa9a8"; // notify

const NUS_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const NUS_RX_UUID      = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"; // write
const NUS_TX_UUID      = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"; // notify

let btDevice = null;
let writeChar = null;
let notifyChar = null;
let connected = false;
let activeProfile = null; // "microbit-uart" | "nus"

window.mbOnLog = window.mbOnLog || ((text, kind) => console.log(kind || "info", text));
window.mbOnConnectionChange = window.mbOnConnectionChange || ((c) => console.log("BLE connected:", c));

function log(text, kind="info"){ window.mbOnLog(text, kind); }
function setConn(c){ connected = c; window.mbOnConnectionChange(c); }
function enc(str){ return new TextEncoder().encode(str); }

function handleLine(msg){
  log("RX < " + msg, "rx");
  if (msg.startsWith("BOOT:"))       log("micro:bit BOOT → " + msg.slice(5), "info");
  else if (msg.startsWith("ACK:"))   log("micro:bit ACK → " + msg.slice(4), "success");
  else if (msg.startsWith("STATE:")) log("micro:bit STATE → " + msg.slice(6), "info");
  else if (msg.startsWith("ERR:"))   log("micro:bit ERROR → " + msg.slice(4), "error");
  else if (msg.startsWith("RX:"))    log("micro:bit saw → " + msg.slice(3), "info");
}

function onNotify(event){
  const text = new TextDecoder().decode(event.target.value);
  text.split(/\r?\n/).forEach(line => {
    const t = line.trim();
    if (t) handleLine(t);
  });
}

async function tryProfile(server, profile){
  if (profile === "microbit-uart"){
    log("BLE: trying micro:bit UART service…", "info");
    const service = await server.getPrimaryService(MB_UART_SERVICE_UUID);
    const rx = await service.getCharacteristic(MB_UART_RX_UUID);
    const tx = await service.getCharacteristic(MB_UART_TX_UUID);
    return { service, rx, tx, name: "microbit-uart" };
  }
  if (profile === "nus"){
  log("BLE: trying Nordic UART service (NUS)…", "info");
  const service = await server.getPrimaryService(NUS_SERVICE_UUID);

  log("BLE: enumerating NUS characteristics…", "info");
  const chars = await service.getCharacteristics();

  // Prefer Nordic IDs, but validate by properties.
  let c2 = null, c3 = null;
  for (const ch of chars) {
    const id = String(ch.uuid).toLowerCase();
    if (id.includes("6e400002")) c2 = ch; // usually RX (write)
    else if (id.includes("6e400003")) c3 = ch; // usually TX (notify)
  }

  const isNotifier = ch => ch && (ch.properties.notify || ch.properties.indicate);
  const isWriter   = ch => ch && (ch.properties.write || ch.properties.writeWithoutResponse);

  // Log properties for diagnostics
  for (const ch of chars) {
    const p = ch.properties;
    log("BLE: char " + ch.uuid + " props=" + JSON.stringify({
      notify: !!p.notify, indicate: !!p.indicate, read: !!p.read,
      write: !!p.write, wwr: !!p.writeWithoutResponse
    }), "info");
  }

  let tx = null, rx = null;

  if (isNotifier(c3)) tx = c3;
  if (isWriter(c2))   rx = c2;

  // If swapped or non-standard, fall back to first notify + first write
  if (!tx || !rx){
    for (const ch of chars) {
      if (!tx && isNotifier(ch)) tx = ch;
      if (!rx && isWriter(ch))   rx = ch;
    }
  }

  if (!tx || !rx) {
    throw new Error("UART characteristics not found (no notify/write pair) in NUS service");
  }

  return { service, rx, tx, name: "nus" };
}
  throw new Error("Unknown profile");
}

async function mbConnect(){
  try{
    if (!navigator.bluetooth){
      log("Web Bluetooth not available. Use Chrome/Edge.", "error");
      return false;
    }

    log("BLE: requesting device (choose your micro:bit)…", "info");
    btDevice = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [MB_UART_SERVICE_UUID, NUS_SERVICE_UUID]
    });

    btDevice.addEventListener("gattserverdisconnected", () => {
      log("BLE: device disconnected", "error");
      setConn(false);
    });

    log("BLE: connecting GATT…", "info");
    const server = await btDevice.gatt.connect();

    // Auto-detect service: try micro:bit UART first, then NUS
    let prof = null;
    try {
      prof = await tryProfile(server, "microbit-uart");
    } catch (e1) {
      log("BLE: micro:bit UART not found, falling back to NUS…", "error");
      prof = await tryProfile(server, "nus");
    }

    writeChar = prof.rx;
    notifyChar = prof.tx;
    activeProfile = prof.name;

    log("BLE: starting notifications…", "info");
    try {
      if (!notifyChar?.properties?.notify && !notifyChar?.properties?.indicate) {
        throw new Error("Selected TX characteristic does not support notify/indicate");
      }
      await notifyChar.startNotifications();
      notifyChar.addEventListener("characteristicvaluechanged", onNotify);
      log("BLE: notifications started ✔", "success");
    } catch (e) {
      log("BLE: startNotifications failed: " + (e?.message || e), "error");
      log("BLE: TX uuid=" + (notifyChar?.uuid || "?") + " props=" + JSON.stringify({notify:notifyChar?.properties?.notify, indicate:notifyChar?.properties?.indicate, read:notifyChar?.properties?.read, write:notifyChar?.properties?.write, wwr:notifyChar?.properties?.writeWithoutResponse}), "error");
      throw e;
    }

    setConn(true);
    log("BLE connected ✔ profile=" + activeProfile, "success");
    return true;

  } catch(err){
    console.error(err);
    log("BLE connect failed: " + (err?.message || err), "error");
    setConn(false);
    return false;
  }
}

async function mbDisconnect(){
  try{
    log("BLE: disconnecting…", "info");
    if (notifyChar){
      try { await notifyChar.stopNotifications(); } catch {}
    }
    if (btDevice?.gatt?.connected) btDevice.gatt.disconnect();
  } finally {
    activeProfile = null;
    setConn(false);
    log("BLE disconnected", "info");
  }
}

async function mbSendLine(line){
  if (!writeChar || !connected){
    log("TX blocked (not connected): " + line, "error");
    return false;
  }
  try{
    log("TX > " + line, "tx");
    await writeChar.writeValue(enc(line + "\n"));
    return true;
  } catch(err){
    log("TX error: " + (err?.message || err), "error");
    return false;
  }
}

function mbIsConnected(){ return connected; }
function mbProfile(){ return activeProfile; }

window.mbConnect = mbConnect;
window.mbDisconnect = mbDisconnect;
window.mbSendLine = mbSendLine;
window.mbIsConnected = mbIsConnected;
window.mbProfile = mbProfile;
