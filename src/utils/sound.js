// ── Sound effects via Web Audio API ──

let ctx = null;

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return ctx;
}

function playTone(freq, duration, type = 'sine', vol = 0.15) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration);
  } catch {
    // silently fail
  }
}

export function playCorrect() {
  playTone(880, 0.12, 'sine', 0.12);
  setTimeout(() => playTone(1100, 0.15, 'sine', 0.1), 80);
}

export function playWrong() {
  playTone(220, 0.2, 'sawtooth', 0.08);
  setTimeout(() => playTone(180, 0.25, 'sawtooth', 0.06), 100);
}

export function playCombo(streak) {
  const base = 600 + streak * 40;
  playTone(base, 0.08, 'square', 0.06);
  setTimeout(() => playTone(base + 200, 0.08, 'square', 0.06), 60);
  setTimeout(() => playTone(base + 400, 0.12, 'sine', 0.1), 120);
}
