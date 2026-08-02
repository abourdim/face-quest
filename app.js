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
const btnSwitchCamera = document.getElementById("btnSwitchCamera");
const btnMirror = document.getElementById("btnMirror");
const camDot = document.getElementById("camDot");
const camState = document.getElementById("camState");
const mirrorDot = document.getElementById("mirrorDot");
const mirrorState = document.getElementById("mirrorState");


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

// ═══════════════════════════════════════════════════════════════════
// i18n (EN/FR/AR) -- same data-i18n + dictionary pattern used across the
// WDIY app family. I18N.en is authoritative (most keys here have no static
// DOM home -- status/log/speech lines); fr/ar override it, ORIG is a last-
// resort fallback for stray untagged markup.
// ═══════════════════════════════════════════════════════════════════
const RTL_LANGS = { ar: true };
const I18N = {
  en: {
    hero_title: "🤖 Face Quest Lab • Level Up!",
    hero_sub: "Teach the app your face • Unlock missions • micro:bit Robot Buddy",
    label_xp: "XP:", btn_clear_cache: "Clear cache",
    card_scanner_title: "📷 FACE SCANNER",
    card_scanner_sub: "Center your face in the frame, then teach (enroll) or unlock (verify).",
    btn_start_mission: "Start Mission", btn_teach_face: "Teach My Face", btn_unlock: "Unlock!",
    btn_lock: "Lock!", btn_reset_face: "Reset Face",
    speech_off: "Speech: Off", speech_on: "Speech: On", speech_unsupported: "Speech: Unsupported",
    btn_voice: "Voice", btn_switch_camera: "Switch camera",
    mirror_on: "Mirror ON", mirror_off: "Mirror OFF",
    label_detector: "Detector", opt_detector_ssd: "SSD (accurate)", opt_detector_tiny: "Tiny (fast)",
    label_distance: "Distance", opt_distance_euclidean: "Euclidean", opt_distance_cosine: "Cosine",
    label_threshold: "Threshold", label_verify_frames: "Verify frames",
    btn_test_mode: "Test Mode", btn_test_mode_on: "Test Mode: ON", btn_set_pin: "Set PIN",
    tips_title: "Quick Tips",
    tip_1: "Use good light (like a science lab!) and keep your face centered",
    tip_2: "Teach once, then unlock anytime",
    tip_3: "If it says &ldquo;No Match&rdquo; a lot: try moving closer or gently raising the threshold",
    card_robot_title: "🔗 ROBOT BUDDY (micro:bit)",
    card_robot_sub: "BLE UART link — your robot can celebrate MATCH / NO",
    btn_connect: "Connect", btn_disconnect: "Disconnect", btn_send_test: "Send TEST",
    tips_connect_title: "How to connect",
    tip_connect_1: "Flash micro:bit MakeCode program (BLE UART)",
    tip_connect_2: "Click Connect and select &ldquo;BBC micro:bit&rdquo;",
    tip_connect_3: "Unlock → sends MATCH / NO, micro:bit replies with ACK/STATE",
    card_log_title: "🧾 QUEST LOG", card_log_sub: "Geeky logs (timestamp • module tag • color coded)",
    btn_copy: "Copy", btn_clear: "Clear", footer_local: "local • on-device",
    link_get_code: "Get micro:bit code", btn_cancel: "Cancel",
    test_mode_active: "TEST MODE ACTIVE — continuous scan —", btn_stop: "Stop",
    status_idle: "Idle. Click Start.", status_loading: "Loading",
    cam_off: "Camera: OFF", cam_on_prefix: "Camera: ON (", cam_back: "Back", cam_front: "Front", cam_on_suffix: ")",
    mirror_state_on: "Mirror: ON", mirror_state_off: "Mirror: OFF",
    pin_title_set: "🔑 Set a new 4-digit PIN", pin_title_enter: "🔐 Enter PIN to unlock Test Mode",
    pin_error_wrong: "Wrong PIN — try again",
    mb_disconnected: "DISCONNECTED", mb_connected: "CONNECTED",
    status_listening: "Listening… say: Start / Teach / Unlock / Lock / Reset",
    status_try_voice: "Try: Start / Teach / Unlock / Lock / Reset",
    status_voice_error: "Voice error — try again.",
    status_locked: "Locked 🔒", status_auto_locked: "Auto-locked 🔒 (face gone)",
    status_start_camera_first: "Start the camera first!", status_teach_face_first: "Teach your face first!",
    status_test_locked_noface: "TEST: Locked 🔒 (no face)",
    status_test_unlocked_prefix: "TEST: Unlocked ✅ (d=", status_paren_suffix: ")",
    status_test_locked_prefix: "TEST: Locked ❌ (d=",
    status_test_ended: "Test mode ended. Locked 🔒",
    status_brain_loaded: "Brain modules loaded! 🤓 Camera ready.",
    status_powering_camera: "Powering up camera…",
    status_camera_ready: "Camera ready! Teach your face to begin.",
    status_teaching: "Teaching mode… Hold still like a statue 🗿",
    status_not_enough_frames: "Hmm… not enough clear frames. Add light + try again!",
    status_face_learned_prefix: "Face learned! ✔ (", status_samples_suffix: " samples)",
    status_teach_first: "First, teach your face (Enroll).",
    status_scanning: "Scanning… Hold still 😄",
    status_too_wiggly: "Scan too wiggly — move closer + hold still.",
    status_unlocked_prefix: "UNLOCKED! ✅ (confidence ", status_pct_suffix: "%)",
    status_nope_prefix: "Nope — try again ❌ (confidence ",
    status_face_reset: "Face reset complete.",
    status_start_failed_prefix: "Start failed: ",
    status_switching_camera: "Switching camera…",
    status_camera_ready_unlock: "Camera ready! Teach your face or unlock.",
    status_switch_camera_failed_prefix: "Switch camera failed: ",
    status_enroll_failed_prefix: "Enroll failed: ", status_verify_failed_prefix: "Verify failed: ",
    status_clear_failed_prefix: "Clear failed: ", status_ready_mission: "Ready for a mission. Click Start Mission!",
    log_speech_blocked_prefix: "Speech blocked: ",
    log_voice_unsupported: "Voice commands not supported in this browser",
    log_heard_prefix: "Heard: ", log_voice_error_prefix: "Voice error: ", log_voice_error_unknown: "unknown",
    log_state_prefix: "State → ", log_manual_lock: "Manual lock",
    log_no_face_autolock_prefix: "No face for ", log_no_face_autolock_suffix: "s → auto-lock",
    log_test_mode_activated: "Test Mode activated — continuous scan",
    log_test_match_prefix: "TEST MATCH d=", log_test_nomatch_prefix: "TEST NO MATCH d=",
    log_test_mode_stopped: "Test Mode stopped",
    log_pin_updated: "PIN updated", log_pin_correct: "PIN correct — access granted", log_pin_wrong: "Wrong PIN",
    log_loading_models_prefix: "Loading face-api models from ",
    log_loaded_ssd: "Loaded: ssdMobilenetv1", log_loaded_tiny: "Loaded: tinyFaceDetector",
    log_loaded_landmark: "Loaded: faceLandmark68Net", log_loaded_recognition: "Loaded: faceRecognitionNet",
    log_no_face_detected: "No face detected",
    log_low_score_prefix: "Low detection score (", log_low_score_mid: " < ", log_paren_suffix: ")",
    log_face_too_small_prefix: "Face too small (", log_face_too_small_mid: "px). Move closer.",
    log_too_blurry_prefix: "Image too blurry (blurVar=", log_too_blurry_mid: " < ",
    log_requesting_camera: "Requesting camera…", log_camera_started: "Camera started",
    log_enroll_requested: "Enroll requested",
    log_enroll_sample_prefix: "Enroll sample ", log_enroll_sample_mid: "/", log_enroll_sample_suffix: " ok",
    log_enroll_only_prefix: "Enroll: only ", log_usable_samples_suffix: " usable samples",
    log_enrollment_saved_prefix: "Enrollment saved (", log_samples_averaged_suffix: " samples averaged)",
    log_verify_no_enrollment: "Verify requested but no enrollment exists", log_verify_requested: "Verify requested",
    log_frame_prefix: "Frame ", log_frame_mid: "/", log_frame_distance_mid: ": distance=",
    log_verify_only_prefix: "Verify: only ", log_usable_frames_suffix: " usable frames",
    log_match_distance_prefix: "MATCH distance(median)=", log_nomatch_distance_prefix: "NO MATCH distance(median)=",
    log_enrollment_cleared: "Enrollment cleared",
    log_detector_set_prefix: "Detector set to ", log_distance_metric_prefix: "Distance metric set to ",
    log_camera_switched: "Camera switched",
    log_speech_toggle_prefix: "Speech ", log_speech_enabled: "enabled", log_speech_disabled: "disabled",
    log_copied_clipboard: "Logs copied to clipboard", log_clipboard_blocked: "Clipboard blocked; select & copy manually",
    log_log_cleared: "Log cleared",
    log_cache_unavailable: "Cache API not available", log_cache_cleared: "Cache cleared. Reload to refetch assets.",
    log_xp_stays: "XP stays (stored separately).",
    log_mb_connect_requested: "micro:bit connect requested", log_mb_connect_failed_prefix: "micro:bit connect failed: ",
    log_mb_disconnect_requested: "micro:bit disconnect requested", log_mb_disconnect_failed_prefix: "micro:bit disconnect failed: ",
    log_mb_send_test: "Send TEST to micro:bit", log_test_send_failed_prefix: "TEST send failed: ",
    log_found_existing_enrollment: "Found existing enrollment in local storage",
    log_ble_connected: "BLE connected", log_ble_disconnected: "BLE disconnected",
    speak_voice_unsupported: "Voice commands are not supported in this browser.",
    speak_listening: "Listening. Say start, teach, unlock, lock, or reset.",
    speak_starting_mission: "Starting mission.", speak_teaching_face: "Teaching your face.",
    speak_scanning_unlock: "Scanning to unlock.", speak_resetting_face: "Resetting face.", speak_locking: "Locking.",
    speak_no_command: "I did not catch a command. Try start, teach, unlock, lock, or reset.",
    speak_voice_error: "Voice error. Try again.",
    speak_robot_connected: "Robot buddy connected.", speak_robot_disconnected: "Robot buddy disconnected.",
    speak_locked: "Locked.", speak_auto_locked: "Auto locked. Face not detected.",
    speak_start_camera_first: "Start the camera first.", speak_teach_face_first: "Teach your face first.",
    speak_test_mode_on: "Test mode on. Continuous scanning.", speak_test_mode_off: "Test mode off.",
    speak_pin_saved: "PIN saved.", speak_access_granted: "Access granted.", speak_wrong_pin: "Wrong pin.",
    speak_camera_ready: "Camera ready. Teach your face to begin.", speak_teaching_mode: "Teaching mode. Hold still.",
    speak_not_enough_frames: "Not enough clear frames. Add light and try again.",
    speak_face_learned: "Face learned. You're ready to unlock.", speak_teach_first: "First, teach your face.",
    speak_scanning: "Scanning. Hold still.", speak_too_wiggly: "Scan too wiggly. Move closer and hold still.",
    speak_unlocked: "Unlocked.", speak_no_match: "No match. Try again.", speak_face_reset: "Face reset complete.",
    speak_speech_on: "Speech on.",
    xp_reason_locked_manually: "Locked manually", xp_reason_lab_access: "Lab access granted",
    xp_reason_face_trained: "Face trained", xp_reason_door_unlocked: "Door unlocked"
  },
  fr: {
    hero_title: "🤖 Face Quest Lab • Niveau supérieur !",
    hero_sub: "Apprenez votre visage à l'appli • Débloquez des missions • Robot Buddy micro:bit",
    label_xp: "XP :", btn_clear_cache: "Vider le cache",
    card_scanner_title: "📷 SCANNER DE VISAGE",
    card_scanner_sub: "Centrez votre visage dans le cadre, puis apprenez (enroll) ou déverrouillez (verify).",
    btn_start_mission: "Démarrer la mission", btn_teach_face: "Apprendre mon visage", btn_unlock: "Déverrouiller !",
    btn_lock: "Verrouiller !", btn_reset_face: "Réinitialiser le visage",
    speech_off: "Voix : Désactivée", speech_on: "Voix : Activée", speech_unsupported: "Voix : Non prise en charge",
    btn_voice: "Voix", btn_switch_camera: "Changer de caméra",
    mirror_on: "Miroir ACTIVÉ", mirror_off: "Miroir DÉSACTIVÉ",
    label_detector: "Détecteur", opt_detector_ssd: "SSD (précis)", opt_detector_tiny: "Tiny (rapide)",
    label_distance: "Distance", opt_distance_euclidean: "Euclidienne", opt_distance_cosine: "Cosinus",
    label_threshold: "Seuil", label_verify_frames: "Images de vérification",
    btn_test_mode: "Mode test", btn_test_mode_on: "Mode test : ACTIVÉ", btn_set_pin: "Définir un PIN",
    tips_title: "Astuces rapides",
    tip_1: "Utilisez une bonne lumière (comme un labo scientifique !) et gardez votre visage centré",
    tip_2: "Apprenez une fois, puis déverrouillez à tout moment",
    tip_3: "Si ça dit souvent « Pas de correspondance » : rapprochez-vous ou augmentez légèrement le seuil",
    card_robot_title: "🔗 ROBOT BUDDY (micro:bit)",
    card_robot_sub: "Liaison BLE UART — votre robot peut célébrer MATCH / NO",
    btn_connect: "Connecter", btn_disconnect: "Déconnecter", btn_send_test: "Envoyer TEST",
    tips_connect_title: "Comment se connecter",
    tip_connect_1: "Flashez le programme MakeCode du micro:bit (BLE UART)",
    tip_connect_2: "Cliquez sur Connecter et sélectionnez « BBC micro:bit »",
    tip_connect_3: "Déverrouiller → envoie MATCH / NO, le micro:bit répond avec ACK/STATE",
    card_log_title: "🧾 JOURNAL DE QUÊTE", card_log_sub: "Journaux techniques (horodatage • module • couleur)",
    btn_copy: "Copier", btn_clear: "Effacer", footer_local: "local • sur l'appareil",
    link_get_code: "Obtenir le code micro:bit", btn_cancel: "Annuler",
    test_mode_active: "MODE TEST ACTIF — scan continu —", btn_stop: "Arrêter",
    status_idle: "Inactif. Cliquez sur Démarrer.", status_loading: "Chargement",
    cam_off: "Caméra : ÉTEINTE", cam_on_prefix: "Caméra : ACTIVÉE (", cam_back: "Arrière", cam_front: "Avant", cam_on_suffix: ")",
    mirror_state_on: "Miroir : ACTIVÉ", mirror_state_off: "Miroir : DÉSACTIVÉ",
    pin_title_set: "🔑 Définissez un nouveau PIN à 4 chiffres", pin_title_enter: "🔐 Entrez le PIN pour déverrouiller le mode test",
    pin_error_wrong: "PIN incorrect — réessayez",
    mb_disconnected: "DÉCONNECTÉ", mb_connected: "CONNECTÉ",
    status_listening: "Écoute… dites : Start / Teach / Unlock / Lock / Reset",
    status_try_voice: "Essayez : Start / Teach / Unlock / Lock / Reset",
    status_voice_error: "Erreur vocale — réessayez.",
    status_locked: "Verrouillé 🔒", status_auto_locked: "Verrouillage auto 🔒 (visage disparu)",
    status_start_camera_first: "Démarrez d'abord la caméra !", status_teach_face_first: "Apprenez d'abord votre visage !",
    status_test_locked_noface: "TEST : Verrouillé 🔒 (aucun visage)",
    status_test_unlocked_prefix: "TEST : Déverrouillé ✅ (d=", status_paren_suffix: ")",
    status_test_locked_prefix: "TEST : Verrouillé ❌ (d=",
    status_test_ended: "Mode test terminé. Verrouillé 🔒",
    status_brain_loaded: "Modules cérébraux chargés ! 🤓 Caméra prête.",
    status_powering_camera: "Démarrage de la caméra…",
    status_camera_ready: "Caméra prête ! Apprenez votre visage pour commencer.",
    status_teaching: "Mode apprentissage… Restez immobile comme une statue 🗿",
    status_not_enough_frames: "Hmm… pas assez d'images nettes. Ajoutez de la lumière et réessayez !",
    status_face_learned_prefix: "Visage appris ! ✔ (", status_samples_suffix: " échantillons)",
    status_teach_first: "D'abord, apprenez votre visage (Enroll).",
    status_scanning: "Scan en cours… Restez immobile 😄",
    status_too_wiggly: "Scan trop instable — rapprochez-vous et restez immobile.",
    status_unlocked_prefix: "DÉVERROUILLÉ ! ✅ (confiance ", status_pct_suffix: "%)",
    status_nope_prefix: "Non — réessayez ❌ (confiance ",
    status_face_reset: "Réinitialisation du visage terminée.",
    status_start_failed_prefix: "Échec du démarrage : ",
    status_switching_camera: "Changement de caméra…",
    status_camera_ready_unlock: "Caméra prête ! Apprenez votre visage ou déverrouillez.",
    status_switch_camera_failed_prefix: "Échec du changement de caméra : ",
    status_enroll_failed_prefix: "Échec de l'apprentissage : ", status_verify_failed_prefix: "Échec de la vérification : ",
    status_clear_failed_prefix: "Échec de la réinitialisation : ", status_ready_mission: "Prêt pour une mission. Cliquez sur Démarrer la mission !",
    log_speech_blocked_prefix: "Voix bloquée : ",
    log_voice_unsupported: "Commandes vocales non prises en charge dans ce navigateur",
    log_heard_prefix: "Entendu : ", log_voice_error_prefix: "Erreur vocale : ", log_voice_error_unknown: "inconnue",
    log_state_prefix: "État → ", log_manual_lock: "Verrouillage manuel",
    log_no_face_autolock_prefix: "Aucun visage depuis ", log_no_face_autolock_suffix: "s → verrouillage auto",
    log_test_mode_activated: "Mode test activé — scan continu",
    log_test_match_prefix: "TEST CORRESPONDANCE d=", log_test_nomatch_prefix: "TEST AUCUNE CORRESPONDANCE d=",
    log_test_mode_stopped: "Mode test arrêté",
    log_pin_updated: "PIN mis à jour", log_pin_correct: "PIN correct — accès accordé", log_pin_wrong: "PIN incorrect",
    log_loading_models_prefix: "Chargement des modèles face-api depuis ",
    log_loaded_ssd: "Chargé : ssdMobilenetv1", log_loaded_tiny: "Chargé : tinyFaceDetector",
    log_loaded_landmark: "Chargé : faceLandmark68Net", log_loaded_recognition: "Chargé : faceRecognitionNet",
    log_no_face_detected: "Aucun visage détecté",
    log_low_score_prefix: "Score de détection faible (", log_low_score_mid: " < ", log_paren_suffix: ")",
    log_face_too_small_prefix: "Visage trop petit (", log_face_too_small_mid: "px). Rapprochez-vous.",
    log_too_blurry_prefix: "Image trop floue (blurVar=", log_too_blurry_mid: " < ",
    log_requesting_camera: "Demande de la caméra…", log_camera_started: "Caméra démarrée",
    log_enroll_requested: "Apprentissage demandé",
    log_enroll_sample_prefix: "Échantillon d'apprentissage ", log_enroll_sample_mid: "/", log_enroll_sample_suffix: " ok",
    log_enroll_only_prefix: "Apprentissage : seulement ", log_usable_samples_suffix: " échantillons utilisables",
    log_enrollment_saved_prefix: "Apprentissage enregistré (", log_samples_averaged_suffix: " échantillons moyennés)",
    log_verify_no_enrollment: "Vérification demandée mais aucun apprentissage n'existe", log_verify_requested: "Vérification demandée",
    log_frame_prefix: "Image ", log_frame_mid: "/", log_frame_distance_mid: " : distance=",
    log_verify_only_prefix: "Vérification : seulement ", log_usable_frames_suffix: " images utilisables",
    log_match_distance_prefix: "CORRESPONDANCE distance(médiane)=", log_nomatch_distance_prefix: "AUCUNE CORRESPONDANCE distance(médiane)=",
    log_enrollment_cleared: "Apprentissage effacé",
    log_detector_set_prefix: "Détecteur réglé sur ", log_distance_metric_prefix: "Métrique de distance réglée sur ",
    log_camera_switched: "Caméra changée",
    log_speech_toggle_prefix: "Voix ", log_speech_enabled: "activée", log_speech_disabled: "désactivée",
    log_copied_clipboard: "Journaux copiés dans le presse-papiers", log_clipboard_blocked: "Presse-papiers bloqué ; sélectionnez et copiez manuellement",
    log_log_cleared: "Journal effacé",
    log_cache_unavailable: "API Cache non disponible", log_cache_cleared: "Cache vidé. Rechargez pour récupérer les ressources.",
    log_xp_stays: "L'XP reste (stockée séparément).",
    log_mb_connect_requested: "Connexion micro:bit demandée", log_mb_connect_failed_prefix: "Échec de connexion micro:bit : ",
    log_mb_disconnect_requested: "Déconnexion micro:bit demandée", log_mb_disconnect_failed_prefix: "Échec de déconnexion micro:bit : ",
    log_mb_send_test: "Envoi de TEST au micro:bit", log_test_send_failed_prefix: "Échec de l'envoi TEST : ",
    log_found_existing_enrollment: "Apprentissage existant trouvé dans le stockage local",
    log_ble_connected: "BLE connecté", log_ble_disconnected: "BLE déconnecté",
    speak_voice_unsupported: "Les commandes vocales ne sont pas prises en charge par ce navigateur.",
    speak_listening: "Écoute. Dites start, teach, unlock, lock, ou reset.",
    speak_starting_mission: "Démarrage de la mission.", speak_teaching_face: "Apprentissage de votre visage.",
    speak_scanning_unlock: "Scan pour déverrouiller.", speak_resetting_face: "Réinitialisation du visage.", speak_locking: "Verrouillage.",
    speak_no_command: "Je n'ai pas compris. Essayez start, teach, unlock, lock, ou reset.",
    speak_voice_error: "Erreur vocale. Réessayez.",
    speak_robot_connected: "Robot buddy connecté.", speak_robot_disconnected: "Robot buddy déconnecté.",
    speak_locked: "Verrouillé.", speak_auto_locked: "Verrouillage automatique. Visage non détecté.",
    speak_start_camera_first: "Démarrez d'abord la caméra.", speak_teach_face_first: "Apprenez d'abord votre visage.",
    speak_test_mode_on: "Mode test activé. Scan continu.", speak_test_mode_off: "Mode test désactivé.",
    speak_pin_saved: "PIN enregistré.", speak_access_granted: "Accès accordé.", speak_wrong_pin: "PIN incorrect.",
    speak_camera_ready: "Caméra prête. Apprenez votre visage pour commencer.", speak_teaching_mode: "Mode apprentissage. Restez immobile.",
    speak_not_enough_frames: "Pas assez d'images nettes. Ajoutez de la lumière et réessayez.",
    speak_face_learned: "Visage appris. Vous pouvez déverrouiller.", speak_teach_first: "D'abord, apprenez votre visage.",
    speak_scanning: "Scan en cours. Restez immobile.", speak_too_wiggly: "Scan trop instable. Rapprochez-vous et restez immobile.",
    speak_unlocked: "Déverrouillé.", speak_no_match: "Aucune correspondance. Réessayez.", speak_face_reset: "Réinitialisation du visage terminée.",
    speak_speech_on: "Voix activée.",
    xp_reason_locked_manually: "Verrouillé manuellement", xp_reason_lab_access: "Accès au labo accordé",
    xp_reason_face_trained: "Visage appris", xp_reason_door_unlocked: "Porte déverrouillée"
  },
  ar: {
    hero_title: "🤖 Face Quest Lab • ارتقِ بمستواك!",
    hero_sub: "علّم التطبيق وجهك • افتح المهام • رفيق الروبوت micro:bit",
    label_xp: "نقاط الخبرة:", btn_clear_cache: "مسح الذاكرة المؤقتة",
    card_scanner_title: "📷 ماسح الوجه",
    card_scanner_sub: "ضع وجهك في وسط الإطار، ثم علّمه (تسجيل) أو افتحه (تحقق).",
    btn_start_mission: "بدء المهمة", btn_teach_face: "علّم وجهي", btn_unlock: "افتح!",
    btn_lock: "أغلق!", btn_reset_face: "إعادة ضبط الوجه",
    speech_off: "الصوت: متوقف", speech_on: "الصوت: مفعّل", speech_unsupported: "الصوت: غير مدعوم",
    btn_voice: "صوت", btn_switch_camera: "تبديل الكاميرا",
    mirror_on: "المرآة مفعّلة", mirror_off: "المرآة معطّلة",
    label_detector: "الكاشف", opt_detector_ssd: "SSD (دقيق)", opt_detector_tiny: "Tiny (سريع)",
    label_distance: "المسافة", opt_distance_euclidean: "إقليدية", opt_distance_cosine: "جيب التمام",
    label_threshold: "الحد الأدنى", label_verify_frames: "إطارات التحقق",
    btn_test_mode: "وضع الاختبار", btn_test_mode_on: "وضع الاختبار: مفعّل", btn_set_pin: "تعيين رمز PIN",
    tips_title: "نصائح سريعة",
    tip_1: "استخدم إضاءة جيدة (مثل مختبر علمي!) وأبقِ وجهك في المنتصف",
    tip_2: "علّمه مرة واحدة، ثم افتحه في أي وقت",
    tip_3: "إذا ظهرت \"لا تطابق\" كثيرًا: اقترب أكثر أو ارفع الحد الأدنى قليلاً",
    card_robot_title: "🔗 رفيق الروبوت (micro:bit)",
    card_robot_sub: "اتصال BLE UART — يمكن لروبوتك الاحتفال بـ MATCH / NO",
    btn_connect: "اتصال", btn_disconnect: "قطع الاتصال", btn_send_test: "إرسال TEST",
    tips_connect_title: "كيفية الاتصال",
    tip_connect_1: "فلاش برنامج MakeCode على micro:bit (BLE UART)",
    tip_connect_2: "اضغط اتصال واختر \"BBC micro:bit\"",
    tip_connect_3: "فتح ← يرسل MATCH / NO، ويرد micro:bit بـ ACK/STATE",
    card_log_title: "🧾 سجل المهمة", card_log_sub: "سجلات تقنية (الوقت • وسم الوحدة • ألوان)",
    btn_copy: "نسخ", btn_clear: "مسح", footer_local: "محلي • على الجهاز",
    link_get_code: "الحصول على كود micro:bit", btn_cancel: "إلغاء",
    test_mode_active: "وضع الاختبار نشط — فحص مستمر —", btn_stop: "إيقاف",
    status_idle: "خامل. اضغط بدء.", status_loading: "جاري التحميل",
    cam_off: "الكاميرا: متوقفة", cam_on_prefix: "الكاميرا: مفعّلة (", cam_back: "خلفية", cam_front: "أمامية", cam_on_suffix: ")",
    mirror_state_on: "المرآة: مفعّلة", mirror_state_off: "المرآة: معطّلة",
    pin_title_set: "🔑 عيّن رمز PIN جديد من 4 أرقام", pin_title_enter: "🔐 أدخل رمز PIN لفتح وضع الاختبار",
    pin_error_wrong: "رمز PIN خاطئ — حاول مجددًا",
    mb_disconnected: "غير متصل", mb_connected: "متصل",
    status_listening: "الاستماع… قل: Start / Teach / Unlock / Lock / Reset",
    status_try_voice: "جرّب: Start / Teach / Unlock / Lock / Reset",
    status_voice_error: "خطأ صوتي — حاول مجددًا.",
    status_locked: "مغلق 🔒", status_auto_locked: "إغلاق تلقائي 🔒 (اختفى الوجه)",
    status_start_camera_first: "شغّل الكاميرا أولاً!", status_teach_face_first: "علّم وجهك أولاً!",
    status_test_locked_noface: "اختبار: مغلق 🔒 (لا يوجد وجه)",
    status_test_unlocked_prefix: "اختبار: مفتوح ✅ (d=", status_paren_suffix: ")",
    status_test_locked_prefix: "اختبار: مغلق ❌ (d=",
    status_test_ended: "انتهى وضع الاختبار. مغلق 🔒",
    status_brain_loaded: "تم تحميل وحدات الذكاء! 🤓 الكاميرا جاهزة.",
    status_powering_camera: "تشغيل الكاميرا…",
    status_camera_ready: "الكاميرا جاهزة! علّم وجهك للبدء.",
    status_teaching: "وضع التعليم… ابقَ ثابتًا كالتمثال 🗿",
    status_not_enough_frames: "لا توجد إطارات واضحة كافية. أضف إضاءة وحاول مجددًا!",
    status_face_learned_prefix: "تم تعلّم الوجه! ✔ (", status_samples_suffix: " عيّنات)",
    status_teach_first: "أولاً، علّم وجهك (تسجيل).",
    status_scanning: "جاري الفحص… ابقَ ثابتًا 😄",
    status_too_wiggly: "الفحص غير مستقر — اقترب أكثر وابقَ ثابتًا.",
    status_unlocked_prefix: "تم الفتح! ✅ (ثقة ", status_pct_suffix: "%)",
    status_nope_prefix: "لا — حاول مجددًا ❌ (ثقة ",
    status_face_reset: "اكتملت إعادة ضبط الوجه.",
    status_start_failed_prefix: "فشل البدء: ",
    status_switching_camera: "تبديل الكاميرا…",
    status_camera_ready_unlock: "الكاميرا جاهزة! علّم وجهك أو افتحه.",
    status_switch_camera_failed_prefix: "فشل تبديل الكاميرا: ",
    status_enroll_failed_prefix: "فشل التعليم: ", status_verify_failed_prefix: "فشل التحقق: ",
    status_clear_failed_prefix: "فشل إعادة الضبط: ", status_ready_mission: "جاهز لمهمة. اضغط بدء المهمة!",
    log_speech_blocked_prefix: "الصوت محظور: ",
    log_voice_unsupported: "الأوامر الصوتية غير مدعومة في هذا المتصفح",
    log_heard_prefix: "سُمع: ", log_voice_error_prefix: "خطأ صوتي: ", log_voice_error_unknown: "غير معروف",
    log_state_prefix: "الحالة ← ", log_manual_lock: "إغلاق يدوي",
    log_no_face_autolock_prefix: "لا يوجد وجه منذ ", log_no_face_autolock_suffix: "ث ← إغلاق تلقائي",
    log_test_mode_activated: "تم تفعيل وضع الاختبار — فحص مستمر",
    log_test_match_prefix: "اختبار تطابق d=", log_test_nomatch_prefix: "اختبار عدم تطابق d=",
    log_test_mode_stopped: "توقف وضع الاختبار",
    log_pin_updated: "تم تحديث رمز PIN", log_pin_correct: "رمز PIN صحيح — تم منح الوصول", log_pin_wrong: "رمز PIN خاطئ",
    log_loading_models_prefix: "جاري تحميل نماذج face-api من ",
    log_loaded_ssd: "تم التحميل: ssdMobilenetv1", log_loaded_tiny: "تم التحميل: tinyFaceDetector",
    log_loaded_landmark: "تم التحميل: faceLandmark68Net", log_loaded_recognition: "تم التحميل: faceRecognitionNet",
    log_no_face_detected: "لم يتم اكتشاف وجه",
    log_low_score_prefix: "درجة كشف منخفضة (", log_low_score_mid: " < ", log_paren_suffix: ")",
    log_face_too_small_prefix: "الوجه صغير جدًا (", log_face_too_small_mid: "بكسل). اقترب أكثر.",
    log_too_blurry_prefix: "الصورة ضبابية جدًا (blurVar=", log_too_blurry_mid: " < ",
    log_requesting_camera: "طلب الكاميرا…", log_camera_started: "بدأت الكاميرا",
    log_enroll_requested: "تم طلب التعليم",
    log_enroll_sample_prefix: "عيّنة تعليم ", log_enroll_sample_mid: "/", log_enroll_sample_suffix: " تمت",
    log_enroll_only_prefix: "التعليم: فقط ", log_usable_samples_suffix: " عيّنات قابلة للاستخدام",
    log_enrollment_saved_prefix: "تم حفظ التعليم (", log_samples_averaged_suffix: " عيّنات بالمتوسط)",
    log_verify_no_enrollment: "طُلب التحقق لكن لا يوجد تعليم", log_verify_requested: "تم طلب التحقق",
    log_frame_prefix: "إطار ", log_frame_mid: "/", log_frame_distance_mid: ": المسافة=",
    log_verify_only_prefix: "التحقق: فقط ", log_usable_frames_suffix: " إطارات قابلة للاستخدام",
    log_match_distance_prefix: "تطابق المسافة(الوسيط)=", log_nomatch_distance_prefix: "عدم تطابق المسافة(الوسيط)=",
    log_enrollment_cleared: "تم مسح التعليم",
    log_detector_set_prefix: "تم ضبط الكاشف على ", log_distance_metric_prefix: "تم ضبط مقياس المسافة على ",
    log_camera_switched: "تم تبديل الكاميرا",
    log_speech_toggle_prefix: "الصوت ", log_speech_enabled: "مفعّل", log_speech_disabled: "معطّل",
    log_copied_clipboard: "تم نسخ السجلات إلى الحافظة", log_clipboard_blocked: "الحافظة محظورة؛ حدد وانسخ يدويًا",
    log_log_cleared: "تم مسح السجل",
    log_cache_unavailable: "واجهة Cache API غير متاحة", log_cache_cleared: "تم مسح الذاكرة المؤقتة. أعد التحميل لجلب الموارد.",
    log_xp_stays: "تبقى نقاط الخبرة (مخزّنة بشكل منفصل).",
    log_mb_connect_requested: "تم طلب اتصال micro:bit", log_mb_connect_failed_prefix: "فشل اتصال micro:bit: ",
    log_mb_disconnect_requested: "تم طلب قطع اتصال micro:bit", log_mb_disconnect_failed_prefix: "فشل قطع اتصال micro:bit: ",
    log_mb_send_test: "إرسال TEST إلى micro:bit", log_test_send_failed_prefix: "فشل إرسال TEST: ",
    log_found_existing_enrollment: "تم العثور على تعليم موجود في التخزين المحلي",
    log_ble_connected: "تم اتصال BLE", log_ble_disconnected: "انقطع اتصال BLE",
    speak_voice_unsupported: "الأوامر الصوتية غير مدعومة في هذا المتصفح.",
    speak_listening: "أستمع. قل بدء أو تعليم أو فتح أو إغلاق أو إعادة ضبط.",
    speak_starting_mission: "بدء المهمة.", speak_teaching_face: "تعليم وجهك.",
    speak_scanning_unlock: "فحص للفتح.", speak_resetting_face: "إعادة ضبط الوجه.", speak_locking: "إغلاق.",
    speak_no_command: "لم أفهم الأمر. جرّب بدء أو تعليم أو فتح أو إغلاق أو إعادة ضبط.",
    speak_voice_error: "خطأ صوتي. حاول مجددًا.",
    speak_robot_connected: "تم اتصال رفيق الروبوت.", speak_robot_disconnected: "انقطع اتصال رفيق الروبوت.",
    speak_locked: "مغلق.", speak_auto_locked: "إغلاق تلقائي. لم يتم اكتشاف الوجه.",
    speak_start_camera_first: "شغّل الكاميرا أولاً.", speak_teach_face_first: "علّم وجهك أولاً.",
    speak_test_mode_on: "وضع الاختبار مفعّل. فحص مستمر.", speak_test_mode_off: "وضع الاختبار متوقف.",
    speak_pin_saved: "تم حفظ رمز PIN.", speak_access_granted: "تم منح الوصول.", speak_wrong_pin: "رمز PIN خاطئ.",
    speak_camera_ready: "الكاميرا جاهزة. علّم وجهك للبدء.", speak_teaching_mode: "وضع التعليم. ابقَ ثابتًا.",
    speak_not_enough_frames: "لا توجد إطارات واضحة كافية. أضف إضاءة وحاول مجددًا.",
    speak_face_learned: "تم تعلّم الوجه. يمكنك الآن الفتح.", speak_teach_first: "أولاً، علّم وجهك.",
    speak_scanning: "جاري الفحص. ابقَ ثابتًا.", speak_too_wiggly: "الفحص غير مستقر. اقترب أكثر وابقَ ثابتًا.",
    speak_unlocked: "تم الفتح.", speak_no_match: "لا يوجد تطابق. حاول مجددًا.", speak_face_reset: "اكتملت إعادة ضبط الوجه.",
    speak_speech_on: "تم تفعيل الصوت.",
    xp_reason_locked_manually: "تم الإغلاق يدويًا", xp_reason_lab_access: "تم منح الوصول للمختبر",
    xp_reason_face_trained: "تم تعليم الوجه", xp_reason_door_unlocked: "تم فتح الباب"
  }
};
const ORIG = {};
function tr(key) {
  const lang = document.documentElement.lang || 'en';
  if (I18N[lang] && I18N[lang][key] !== undefined) return I18N[lang][key];
  if (I18N.en[key] !== undefined) return I18N.en[key];
  return ORIG[key] !== undefined ? ORIG[key] : key;
}
function applyLang(lang) {
  if (lang !== 'fr' && lang !== 'ar') lang = 'en';
  document.documentElement.lang = lang;
  document.documentElement.dir = RTL_LANGS[lang] ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(elx => {
    const key = elx.getAttribute('data-i18n');
    if (ORIG[key] === undefined) ORIG[key] = elx.innerHTML;
    elx.innerHTML = tr(key);
  });
  document.querySelectorAll('.lang-flag-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-lang') === lang);
  });
  try { localStorage.setItem('facequest-lang', lang); } catch (e) {}
  if (typeof refreshDynamicUI === 'function') refreshDynamicUI();
}
window.setLang = applyLang;

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
    ? `🔊 ${tr(speechEnabled ? 'speech_on' : 'speech_off')}`
    : `🔊 ${tr('speech_unsupported')}`;
}

function speak(text, { interrupt = true } = {}) {
  if (!speechEnabled || !supportsTTS()) return;
  const msg = String(text || "").trim();
  if (!msg) return;

  try {
    if (interrupt) window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(msg);
    const speechLangs = { en: "en-US", fr: "fr-FR", ar: "ar-SA" };
    u.lang = speechLangs[document.documentElement.lang] || "en-US";
    u.rate = 1.02; // slightly snappy for kids; safe default
    u.pitch = 1.0;
    u.volume = 1.0;
    window.speechSynthesis.speak(u);
  } catch (e) {
    // Don’t break the app if the browser blocks speech.
    logLine("warn", tr('log_speech_blocked_prefix') + (e?.message || e), "SPEECH");
  }
}

function supportsVoiceCommands() {
  return typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
}

async function startVoiceCommandOnce() {
  if (!supportsVoiceCommands()) {
    logLine("warn", tr('log_voice_unsupported'), "SPEECH");
    speak(tr('speak_voice_unsupported'));
    return;
  }

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SR();
  rec.lang = navigator.language || "en-US";
  rec.interimResults = false;
  rec.maxAlternatives = 1;

  setStatus(tr('status_listening'), "info");
  speak(tr('speak_listening'));

  await new Promise((resolve) => {
    rec.onresult = async (ev) => {
      const t = (ev.results?.[0]?.[0]?.transcript || "").toLowerCase();
      logLine("info", tr('log_heard_prefix') + t, "SPEECH");

      // Simple fuzzy commands
      const has = (w) => t.includes(w);
      try {
        if (has("start")) {
          speak(tr('speak_starting_mission'));
          await loadModels();
          await startCamera();
        } else if (has("teach") || has("enroll") || has("train")) {
          speak(tr('speak_teaching_face'));
          await enroll();
        } else if (has("unlock") || has("verify") || has("open")) {
          speak(tr('speak_scanning_unlock'));
          await verify();
        } else if (has("reset") || has("clear")) {
          speak(tr('speak_resetting_face'));
          await clearEnrolled();
        } else if (has("lock")) {
          speak(tr('speak_locking'));
          lockApp();
        } else {
          speak(tr('speak_no_command'));
          setStatus(tr('status_try_voice'), "warn");
        }
      } finally {
        resolve();
      }
    };
    rec.onerror = (e) => {
      logLine("warn", tr('log_voice_error_prefix') + (e?.error || tr('log_voice_error_unknown')), "SPEECH");
      setStatus(tr('status_voice_error'), "warn");
      speak(tr('speak_voice_error'));
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
let currentFacingMode = "user"; // user (front) | environment (back)
let mirrorOn = true;

// ============ LOCK / STATE MACHINE ============
// States: "idle" (no enrollment), "locked" (enrolled, not verified), "unlocked" (verified)
let appState = "idle";
let autoLockTimer = null;
const AUTO_LOCK_SEC = 5; // seconds with no face → auto-lock
let noFaceCount = 0;

// ============ TEST MODE ============
let testModeActive = false;
let testLoopId = null;

// ============ PIN ============
const PIN_KEY = "facequest_pin";
const DEFAULT_PIN = "1234";
let pinBuffer = "";
let pinMode = "verify"; // "verify" | "set"
let pinResolve = null;

// New DOM refs
const btnLock = document.getElementById("btnLock");
const btnTestMode = document.getElementById("btnTestMode");
const btnChangePin = document.getElementById("btnChangePin");
const btnStopTest = document.getElementById("btnStopTest");
const pinOverlay = document.getElementById("pinOverlay");
const pinTitle = document.getElementById("pinTitle");
const pinDots = document.getElementById("pinDots");
const pinError = document.getElementById("pinError");
const pinCancel = document.getElementById("pinCancel");
const testModeBanner = document.getElementById("testModeBanner");

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
    logLine(connected ? "success" : "warn", tr(connected ? 'log_ble_connected' : 'log_ble_disconnected'), "MB");
    speak(tr(connected ? 'speak_robot_connected' : 'speak_robot_disconnected'));
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

// ============ STATE MACHINE ============
function setAppState(newState) {
  appState = newState;
  logLine("info", tr('log_state_prefix') + newState.toUpperCase(), "STATE");

  document.body.classList.remove("state-idle", "state-locked", "state-unlocked");
  document.body.classList.add("state-" + newState);

  if (btnLock) btnLock.style.display = (newState === "unlocked") ? "" : "none";
  if (btnLock) btnLock.disabled = (newState !== "unlocked");
  if (btnVerify) btnVerify.style.display = (newState === "unlocked" && !testModeActive) ? "none" : "";

  if (btnTestMode) btnTestMode.disabled = (newState === "idle");

  if (newState === "unlocked") {
    startAutoLockWatch();
  } else {
    stopAutoLockWatch();
  }
}

function lockApp() {
  if (appState !== "unlocked") return;
  setAppState("locked");
  setStatus(tr('status_locked'), "warn");
  speak(tr('speak_locked'));
  logLine("info", tr('log_manual_lock'), "STATE");
  addXp(2, tr("xp_reason_locked_manually"));
  if (window.mbIsConnected?.()) window.mbSendLine?.("LOCK");
}

// ============ AUTO-LOCK (face disappearance) ============
function startAutoLockWatch() {
  stopAutoLockWatch();
  noFaceCount = 0;
  autoLockTimer = setInterval(async () => {
    if (appState !== "unlocked" || testModeActive) { stopAutoLockWatch(); return; }
    if (!stream || !modelsLoaded) return;

    const opts = (settings.detector === "tiny")
      ? new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 })
      : new faceapi.SsdMobilenetv1Options({ minConfidence: settings.minDetScore });

    const det = await faceapi.detectSingleFace(video, opts);
    if (!det) {
      noFaceCount++;
      if (noFaceCount >= AUTO_LOCK_SEC) {
        logLine("warn", tr('log_no_face_autolock_prefix') + AUTO_LOCK_SEC + tr('log_no_face_autolock_suffix'), "STATE");
        setAppState("locked");
        setStatus(tr('status_auto_locked'), "warn");
        speak(tr('speak_auto_locked'));
        if (window.mbIsConnected?.()) window.mbSendLine?.("LOCK");
      }
    } else {
      noFaceCount = 0;
    }
  }, 1000);
}

function stopAutoLockWatch() {
  if (autoLockTimer) { clearInterval(autoLockTimer); autoLockTimer = null; }
  noFaceCount = 0;
}

// ============ TEST MODE ============
async function startTestMode() {
  if (!modelsLoaded || !stream) {
    setStatus(tr('status_start_camera_first'), "error");
    speak(tr('speak_start_camera_first'));
    return;
  }
  const enrolled = await idbGet();
  if (!enrolled) {
    setStatus(tr('status_teach_face_first'), "error");
    speak(tr('speak_teach_face_first'));
    return;
  }

  testModeActive = true;
  setAppState("locked");
  if (testModeBanner) testModeBanner.style.display = "";
  document.querySelector(".video-wrap")?.classList.add("test-active");
  if (btnTestMode) btnTestMode.textContent = `🧪 ${tr('btn_test_mode_on')}`;
  logLine("success", tr('log_test_mode_activated'), "TEST");
  speak(tr('speak_test_mode_on'));

  const enrolledDesc = new Float32Array(enrolled.descriptor ?? enrolled);
  const thr = settings.threshold;

  testLoopId = setInterval(async () => {
    if (!testModeActive) return;

    const det = await detectFaceOnce();
    if (!det?.descriptor) {
      if (appState === "unlocked") {
        setAppState("locked");
        setStatus(tr('status_test_locked_noface'), "warn");
        if (window.mbIsConnected?.()) window.mbSendLine?.("LOCK");
      }
      return;
    }

    const dist = distanceBetween(det.descriptor, enrolledDesc);
    const isMatch = dist <= thr;

    if (isMatch && appState !== "unlocked") {
      setAppState("unlocked");
      setStatus(tr('status_test_unlocked_prefix') + dist.toFixed(3) + tr('status_paren_suffix'), "success");
      logLine("success", tr('log_test_match_prefix') + dist.toFixed(3), "TEST");
      if (window.mbIsConnected?.()) window.mbSendLine?.("MATCH");
    } else if (!isMatch && appState !== "locked") {
      setAppState("locked");
      setStatus(tr('status_test_locked_prefix') + dist.toFixed(3) + tr('status_paren_suffix'), "error");
      logLine("error", tr('log_test_nomatch_prefix') + dist.toFixed(3), "TEST");
      if (window.mbIsConnected?.()) window.mbSendLine?.("NO");
    }
  }, 1200);
}

function stopTestMode() {
  testModeActive = false;
  if (testLoopId) { clearInterval(testLoopId); testLoopId = null; }
  if (testModeBanner) testModeBanner.style.display = "none";
  document.querySelector(".video-wrap")?.classList.remove("test-active");
  if (btnTestMode) btnTestMode.textContent = `🧪 ${tr('btn_test_mode')}`;
  if (btnVerify) btnVerify.style.display = "";
  logLine("info", tr('log_test_mode_stopped'), "TEST");
  speak(tr('speak_test_mode_off'));
  setAppState("locked");
  setStatus(tr('status_test_ended'), "warn");
}

// ============ PIN SYSTEM ============
async function getStoredPin() {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get("pin");
      req.onsuccess = () => resolve(req.result || DEFAULT_PIN);
      req.onerror = () => resolve(DEFAULT_PIN);
    });
  } catch { return DEFAULT_PIN; }
}

async function savePin(pin) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(pin, "pin");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {}
}

function showPinOverlay(mode) {
  pinMode = mode;
  pinBuffer = "";
  if (pinError) pinError.textContent = "";
  if (pinTitle) {
    pinTitle.textContent = tr(mode === "set" ? 'pin_title_set' : 'pin_title_enter');
  }
  updatePinDots();
  if (pinOverlay) pinOverlay.style.display = "";
}

function hidePinOverlay() {
  if (pinOverlay) pinOverlay.style.display = "none";
  pinBuffer = "";
  if (pinResolve) { pinResolve(false); pinResolve = null; }
}

function updatePinDots() {
  if (!pinDots) return;
  const dots = pinDots.querySelectorAll(".pin-dot-display");
  dots.forEach((dot, i) => {
    dot.classList.toggle("filled", i < pinBuffer.length);
  });
}

function pinShake() {
  const box = document.querySelector(".pin-box");
  if (!box) return;
  box.classList.remove("shake");
  void box.offsetWidth;
  box.classList.add("shake");
}

async function handlePinSubmit() {
  if (pinBuffer.length !== 4) return;

  if (pinMode === "set") {
    await savePin(pinBuffer);
    logLine("success", tr('log_pin_updated'), "PIN");
    speak(tr('speak_pin_saved'));
    hidePinOverlay();
    if (pinResolve) { pinResolve(true); pinResolve = null; }
    return;
  }

  const stored = await getStoredPin();
  if (pinBuffer === stored) {
    logLine("success", tr('log_pin_correct'), "PIN");
    speak(tr('speak_access_granted'));
    addXp(15, tr("xp_reason_lab_access"));
    hidePinOverlay();
    if (pinResolve) { pinResolve(true); pinResolve = null; }
  } else {
    logLine("warn", tr('log_pin_wrong'), "PIN");
    speak(tr('speak_wrong_pin'));
    if (pinError) pinError.textContent = tr('pin_error_wrong');
    pinShake();
    pinBuffer = "";
    updatePinDots();
  }
}

function promptPin(mode) {
  return new Promise((resolve) => {
    pinResolve = resolve;
    showPinOverlay(mode);
  });
}

// ---------------- face-api: load + detect ----------------
async function loadModels() {
  if (modelsLoaded) return;

  if (typeof faceapi === "undefined") {
    throw new Error("faceapi is not defined (face-api.min.js did not load)");
  }

  logLine("info", tr('log_loading_models_prefix') + MODELS_URL, "FACE");
  setUIState("loading", tr('status_loading'));

  // Load both detectors so you can switch at runtime (speed vs accuracy).
  await faceapi.nets.ssdMobilenetv1.loadFromUri(MODELS_URL);
  logLine("success", tr('log_loaded_ssd'), "FACE");

  await faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL);
  logLine("success", tr('log_loaded_tiny'), "FACE");

  await faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_URL);
  logLine("success", tr('log_loaded_landmark'), "FACE");

  await faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_URL);
  logLine("success", tr('log_loaded_recognition'), "FACE");

  modelsLoaded = true;
  setStatus(tr('status_brain_loaded'), "success");
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
    logLine("warn", tr('log_no_face_detected'), "FACE");
    return null;
  }

  // Quality gates: detection confidence + face size + blur
  const score = det.detection?.score ?? 0;
  const box = det.detection?.box;
  if (!box) return null;

  if (score < settings.minDetScore) {
    logLine("warn", tr('log_low_score_prefix') + score.toFixed(2) + tr('log_low_score_mid') + settings.minDetScore + tr('log_paren_suffix'), "FACE");
    return null;
  }

  if (box.width < settings.minFacePx || box.height < settings.minFacePx) {
    logLine("warn", tr('log_face_too_small_prefix') + Math.round(box.width) + tr('log_face_too_small_mid'), "FACE");
    return null;
  }

  const blurVar = estimateBlurVariance(box);
  if (blurVar !== null && blurVar < settings.minBlurVar) {
    logLine("warn", tr('log_too_blurry_prefix') + blurVar.toFixed(0) + tr('log_too_blurry_mid') + settings.minBlurVar + tr('log_paren_suffix'), "FACE");
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


function setDot(dotEl, isOk) {
  if (!dotEl) return;
  dotEl.classList.toggle("ok", !!isOk);
  dotEl.classList.toggle("bad", !isOk);
}

function updateCameraUI(isOn) {
  if (camState) {
    if (!isOn) camState.textContent = tr('cam_off');
    else camState.textContent = tr('cam_on_prefix') + tr(currentFacingMode === "environment" ? 'cam_back' : 'cam_front') + tr('cam_on_suffix');
  }
  setDot(camDot, !!isOn);
}

function updateMirrorUI() {
  if (mirrorState) mirrorState.textContent = tr(mirrorOn ? 'mirror_state_on' : 'mirror_state_off');
  setDot(mirrorDot, mirrorOn);
  if (btnMirror) btnMirror.textContent = "🪞 " + tr(mirrorOn ? 'mirror_on' : 'mirror_off');

  // Mirror is visual only (CSS). It does not change the underlying camera pixels.
  if (video) {
    video.style.transformOrigin = "center";
    video.style.transform = mirrorOn ? "scaleX(-1)" : "scaleX(1)";
  }
}

function stopCamera() {
  try {
    if (stream) {
      for (const t of stream.getTracks()) t.stop();
    }
  } catch (_) {}
  stream = null;
  if (video) video.srcObject = null;
  updateCameraUI(false);
}

// ---------------- Camera ----------------
async function startCamera() {
  logLine("info", tr('log_requesting_camera'), "APP");
  setStatus(tr('status_powering_camera'), "loading");

  // If a stream already exists (e.g., after switching cameras), stop it first.
  if (stream) stopCamera();

  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: currentFacingMode } },
    audio: false
  });

  video.srcObject = stream;
  await new Promise(r => video.onloadedmetadata = r);
  await video.play();

  updateMirrorUI();
  updateCameraUI(true);

  logLine("success", tr('log_camera_started'), "APP");
  setStatus(tr('status_camera_ready'), "success");
  speak(tr('speak_camera_ready'));
  btnEnroll.disabled = false;
}

// ---------------- Enroll + Verify ----------------
async function enroll() {
  setStatus(tr('status_teaching'), "info");
  speak(tr('speak_teaching_mode'));
  logLine("info", tr('log_enroll_requested'), "FACE");

  const target = settings.enrollSamplesTarget;
  const maxAttempts = target * 3;
  const samples = [];

  for (let i = 0, tries = 0; i < target && tries < maxAttempts; tries++) {
    const det = await detectFaceOnce();
    if (det?.descriptor) {
      samples.push(det.descriptor);
      i++;
      logLine("info", tr('log_enroll_sample_prefix') + i + tr('log_enroll_sample_mid') + target + tr('log_enroll_sample_suffix'), "FACE");
    }
    await sleep(90);
  }

  if (samples.length < Math.max(6, Math.floor(target * 0.35))) {
    setStatus(tr('status_not_enough_frames'), "error");
    logLine("error", tr('log_enroll_only_prefix') + samples.length + '/' + target + tr('log_usable_samples_suffix'), "FACE");
    speak(tr('speak_not_enough_frames'), { interrupt: true });
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

  setStatus(tr('status_face_learned_prefix') + samples.length + tr('status_samples_suffix'), "success");
  logLine("success", tr('log_enrollment_saved_prefix') + samples.length + tr('log_samples_averaged_suffix'), "FACE");
  speak(tr('speak_face_learned'));
  setAppState("locked");

  // ⭐ Reward XP for completing an enrollment mission
  addXp(20, tr("xp_reason_face_trained"));

  if (window.mbIsConnected?.()) {
    await window.mbSendLine?.("ENROLLED");
  }
}

async function verify() {
  const stored = await idbGet();
  if (!stored) {
    setStatus(tr('status_teach_first'), "error");
    logLine("error", tr('log_verify_no_enrollment'), "FACE");
    speak(tr('speak_teach_first'), { interrupt: true });
    return;
  }

  const enrolledDesc = new Float32Array(stored.descriptor ?? stored);
  const thr = settings.threshold;
  const N = settings.verifyFrames;

  setStatus(tr('status_scanning'), "info");
  speak(tr('speak_scanning'));
  logLine("info", tr('log_verify_requested'), "FACE");

  const dists = [];
  const maxAttempts = N * 3;

  for (let i = 0, tries = 0; i < N && tries < maxAttempts; tries++) {
    const det = await detectFaceOnce();
    if (det?.descriptor) {
      const dist = distanceBetween(det.descriptor, enrolledDesc);
      dists.push(dist);
      i++;
      logLine("info", tr('log_frame_prefix') + i + tr('log_frame_mid') + N + tr('log_frame_distance_mid') + dist.toFixed(3), "FACE");
    }
    await sleep(70);
  }

  if (dists.length < Math.max(5, Math.floor(N * 0.4))) {
    setStatus(tr('status_too_wiggly'), "error");
    logLine("error", tr('log_verify_only_prefix') + dists.length + '/' + N + tr('log_usable_frames_suffix'), "FACE");
    speak(tr('speak_too_wiggly'), { interrupt: true });
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
    setStatus(tr('status_unlocked_prefix') + Math.round(passRate * 100) + tr('status_pct_suffix'), "success");
    logLine("success", tr('log_match_distance_prefix') + med.toFixed(3), "APP");
    speak(tr('speak_unlocked'), { interrupt: true });
    addXp(10, tr("xp_reason_door_unlocked"));
    setAppState("unlocked");
    if (window.mbIsConnected?.()) await window.mbSendLine?.("MATCH");
  } else {
    setStatus(tr('status_nope_prefix') + Math.round(passRate * 100) + tr('status_pct_suffix'), "error");
    logLine("error", tr('log_nomatch_distance_prefix') + med.toFixed(3), "APP");
    speak(tr('speak_no_match'), { interrupt: true });
    setAppState("locked");
    if (window.mbIsConnected?.()) await window.mbSendLine?.("NO");
  }
}

async function clearEnrolled() {
  if (testModeActive) stopTestMode();
  await idbDel();
  btnVerify.disabled = true;
  btnClear.disabled = true;
  setAppState("idle");
  setStatus(tr('status_face_reset'), "idle");
  logLine("info", tr('log_enrollment_cleared'), "APP");
  speak(tr('speak_face_reset'));
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
    logLine("info", tr('log_detector_set_prefix') + settings.detector, "APP");
  });
}

if (selDistance) {
  selDistance.addEventListener("change", () => {
    settings.distance = selDistance.value;
    // sane default threshold per metric
    settings.threshold = (settings.distance === "euclidean") ? 0.60 : 0.45;
    clampThresholdForDistance();
    syncSettingsUI();
    logLine("info", tr('log_distance_metric_prefix') + settings.distance, "APP");
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
    setStatus(tr('status_start_failed_prefix') + (e?.message || e), "bad");
    logLine("error", tr('status_start_failed_prefix') + (e?.message || e), "APP");
  }
});

/* ---------------- Added: Switch camera + Mirror ---------------- */
// Initialize status pills for the new controls
updateCameraUI(!!stream);
updateMirrorUI();

btnSwitchCamera?.addEventListener("click", async () => {
  try {
    // Toggle between front and back camera
    currentFacingMode = (currentFacingMode === "user") ? "environment" : "user";

    // Default mirror ON for front camera, OFF for back camera (still toggleable)
    mirrorOn = (currentFacingMode === "user");
    updateMirrorUI();

    btnSwitchCamera.disabled = true;
    logLine("info", tr('status_switching_camera'), "APP");
    setStatus(tr('status_switching_camera'), "loading");

    await startCamera();

    setStatus(tr('status_camera_ready_unlock'), "ok");
    logLine("success", tr('log_camera_switched'), "APP");
  } catch (e) {
    console.error(e);
    setStatus(tr('status_switch_camera_failed_prefix') + (e?.message || e), "bad");
    logLine("error", tr('status_switch_camera_failed_prefix') + (e?.message || e), "APP");
    updateCameraUI(!!stream);
  } finally {
    btnSwitchCamera.disabled = false;
  }
});

btnMirror?.addEventListener("click", () => {
  mirrorOn = !mirrorOn;
  updateMirrorUI();
});
/* ---------------- End added controls ---------------- */



btnEnroll?.addEventListener("click", async () => {
  try {
    await enroll();
  } catch (e) {
    console.error(e);
    setStatus(tr('status_enroll_failed_prefix') + (e?.message || e), "bad");
    logLine("error", tr('status_enroll_failed_prefix') + (e?.message || e), "APP");
  }
});

btnVerify?.addEventListener("click", async () => {
  try {
    await verify();
  } catch (e) {
    console.error(e);
    setStatus(tr('status_verify_failed_prefix') + (e?.message || e), "bad");
    logLine("error", tr('status_verify_failed_prefix') + (e?.message || e), "APP");
  }
});

btnClear?.addEventListener("click", async () => {
  try {
    await clearEnrolled();
  } catch (e) {
    console.error(e);
    setStatus(tr('status_clear_failed_prefix') + (e?.message || e), "bad");
    logLine("error", tr('status_clear_failed_prefix') + (e?.message || e), "APP");
  }
});

// Speech UI
btnSpeech?.addEventListener("click", () => {
  speechEnabled = !speechEnabled;
  saveSpeechSetting();
  renderSpeechButton();
  logLine("info", tr('log_speech_toggle_prefix') + tr(speechEnabled ? 'log_speech_enabled' : 'log_speech_disabled'), "SPEECH");
  if (speechEnabled) speak(tr('speak_speech_on'));
});

btnVoice?.addEventListener("click", async () => {
  await startVoiceCommandOnce();
});

btnCopyLog?.addEventListener("click", async () => {
  const txt = logEl?.innerText || "";
  try {
    await navigator.clipboard.writeText(txt);
    logLine("success", tr('log_copied_clipboard'), "APP");
  } catch {
    logLine("warn", tr('log_clipboard_blocked'), "APP");
  }
});

btnClearLog?.addEventListener("click", () => {
  if (logEl) logEl.innerHTML = "";
  logLine("info", tr('log_log_cleared'), "APP");
});

btnClearCache?.addEventListener("click", async () => {
  if (!("caches" in window)) {
    logLine("warn", tr('log_cache_unavailable'), "APP");
    return;
  }
  const keys = await caches.keys();
  await Promise.all(keys.map(k => caches.delete(k)));
  logLine("success", tr('log_cache_cleared'), "APP");
  logLine("info", tr('log_xp_stays'), "XP");
});

// micro:bit BLE events (ble_microbit.js exposes mbConnect/mbDisconnect/mbSendLine, etc.)
function updateMicrobitUI() {
  const ok = window.mbIsConnected?.();
  if (mbConnDot) {
    mbConnDot.classList.remove("ok", "bad");
    mbConnDot.classList.add(ok ? "ok" : "bad");
  }
  if (mbConnText) mbConnText.textContent = tr(ok ? 'mb_connected' : 'mb_disconnected');
}

mbConnectBtn?.addEventListener("click", async () => {
  logLine("info", tr('log_mb_connect_requested'), "APP");
  try {
    await window.mbConnect?.();
    updateMicrobitUI();
  } catch (e) {
    updateMicrobitUI();
    logLine("error", tr('log_mb_connect_failed_prefix') + (e?.message || e), "APP");
  }
});

mbDisconnectBtn?.addEventListener("click", async () => {
  logLine("info", tr('log_mb_disconnect_requested'), "APP");
  try {
    await window.mbDisconnect?.();
    updateMicrobitUI();
  } catch (e) {
    updateMicrobitUI();
    logLine("error", tr('log_mb_disconnect_failed_prefix') + (e?.message || e), "APP");
  }
});

mbTestBtn?.addEventListener("click", async () => {
  logLine("info", tr('log_mb_send_test'), "APP");
  try {
    await window.mbSendLine?.("TEST");
  } catch (e) {
    logLine("error", tr('log_test_send_failed_prefix') + (e?.message || e), "APP");
  }
});

// ============ LOCK / TEST MODE / PIN EVENT LISTENERS ============
btnLock?.addEventListener("click", () => {
  lockApp();
});

btnTestMode?.addEventListener("click", async () => {
  if (testModeActive) {
    stopTestMode();
    return;
  }
  const granted = await promptPin("verify");
  if (granted) {
    await startTestMode();
  }
});

btnStopTest?.addEventListener("click", () => {
  stopTestMode();
});

btnChangePin?.addEventListener("click", async () => {
  await promptPin("set");
});

pinCancel?.addEventListener("click", () => {
  hidePinOverlay();
});

// PIN pad key handlers
document.querySelectorAll(".pin-key").forEach((key) => {
  key.addEventListener("click", () => {
    const k = key.dataset.key;
    if (k === "clear") {
      pinBuffer = "";
      if (pinError) pinError.textContent = "";
    } else if (k === "ok") {
      handlePinSubmit();
      return;
    } else if (pinBuffer.length < 4) {
      pinBuffer += k;
    }
    updatePinDots();
    // Auto-submit when 4 digits entered
    if (pinBuffer.length === 4) {
      setTimeout(() => handlePinSubmit(), 200);
    }
  });
});

// Keyboard support for PIN overlay
document.addEventListener("keydown", (e) => {
  if (!pinOverlay || pinOverlay.style.display === "none") return;
  if (e.key === "Escape") { hidePinOverlay(); return; }
  if (e.key === "Backspace") { pinBuffer = pinBuffer.slice(0, -1); updatePinDots(); return; }
  if (e.key === "Enter") { handlePinSubmit(); return; }
  if (/^[0-9]$/.test(e.key) && pinBuffer.length < 4) {
    pinBuffer += e.key;
    updatePinDots();
    if (pinBuffer.length === 4) setTimeout(() => handlePinSubmit(), 200);
  }
});

// Repaints text set dynamically by JS in the current language -- called at
// the end of applyLang() so a language switch mid-session updates the
// pieces of live state that have a simple current-value re-render (camera/
// mirror/speech/test-mode/BLE), not just static data-i18n tags. Free-form
// status/log messages are left as-is on switch (no tracked "current status
// key" to replay) -- the next event repaints them in the new language.
function refreshDynamicUI() {
  updateCameraUI(!!stream);
  updateMirrorUI();
  updateMicrobitUI();
  renderSpeechButton();
  if (btnTestMode) btnTestMode.textContent = testModeActive ? `🧪 ${tr('btn_test_mode_on')}` : `🧪 ${tr('btn_test_mode')}`;
}

// Initialize
(async function init() {
  let savedLang = 'en';
  try { savedLang = localStorage.getItem('facequest-lang') || 'en'; } catch (e) {}
  applyLang(savedLang);

  // Load XP counter
  loadXp();

  // Load speech toggle state
  loadSpeechSetting();

  setStatus(tr('status_ready_mission'), "idle");

  // ✅ Install BLE->UI log bridge
  installMicrobitLogBridge();

  // See if enrollment exists
  try {
    const enrolled = await idbGet();
    if (enrolled) {
      btnVerify.disabled = false;
      btnClear.disabled = false;
      logLine("info", tr('log_found_existing_enrollment'), "APP");
      setAppState("locked");
    } else {
      setAppState("idle");
    }
  } catch { setAppState("idle"); }

  // micro:bit UI
  updateMicrobitUI();
})();


// Release the camera when leaving the page
window.addEventListener("beforeunload", () => {
  try { stopAutoLockWatch(); } catch (_) {}
  try { if (testModeActive) stopTestMode(); } catch (_) {}
  try { stopCamera(); } catch (_) {}
});
