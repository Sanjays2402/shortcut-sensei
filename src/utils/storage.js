// ── localStorage helpers for progress, daily challenge, and custom shortcuts ──

const PROGRESS_KEY = 'sensei-progress';
const CUSTOM_KEY = 'sensei-custom-shortcuts';
const DAILY_KEY = 'sensei-daily';
const SOUND_KEY = 'sensei-sound';

// ─── Progress tracking ───────────────────────────────────────────────────────

export function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
  } catch { return {}; }
}

/** Record a correct answer for a given app + shortcut task */
export function recordCorrect(app, task) {
  const p = getProgress();
  if (!p[app]) p[app] = {};
  if (!p[app][task]) p[app][task] = { correct: 0, wrong: 0 };
  p[app][task].correct += 1;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}

export function recordWrong(app, task) {
  const p = getProgress();
  if (!p[app]) p[app] = {};
  if (!p[app][task]) p[app][task] = { correct: 0, wrong: 0 };
  p[app][task].wrong += 1;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}

/** Mastered = got correct ≥ 3 times with accuracy ≥ 75% */
export function getMasteredPercent(app, totalShortcuts) {
  const p = getProgress();
  if (!p[app] || totalShortcuts === 0) return 0;
  let mastered = 0;
  for (const task of Object.keys(p[app])) {
    const { correct, wrong } = p[app][task];
    const total = correct + wrong;
    if (correct >= 3 && total > 0 && (correct / total) >= 0.75) mastered++;
  }
  return Math.round((mastered / totalShortcuts) * 100);
}

// ─── Daily challenge ─────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/** Seeded shuffle based on date string */
function seededShuffle(arr, seed) {
  const result = [...arr];
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  for (let i = result.length - 1; i > 0; i--) {
    h = ((h << 5) - h + i) | 0;
    const j = Math.abs(h) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function getDailyQuestions(allShortcuts) {
  const today = todayStr();
  // Flatten all shortcuts with app labels
  const pool = [];
  for (const [app, list] of Object.entries(allShortcuts)) {
    for (const s of list) {
      pool.push({ ...s, app });
    }
  }
  return seededShuffle(pool, today).slice(0, 10);
}

export function getDailyScore() {
  try {
    const d = JSON.parse(localStorage.getItem(DAILY_KEY) || '{}');
    if (d.date === todayStr()) return d;
    return null;
  } catch { return null; }
}

export function saveDailyScore(score) {
  localStorage.setItem(DAILY_KEY, JSON.stringify({ date: todayStr(), ...score }));
}

// ─── Custom shortcuts ────────────────────────────────────────────────────────

export function getCustomShortcuts() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]');
  } catch { return []; }
}

export function saveCustomShortcuts(list) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
}

// ─── Sound preference ────────────────────────────────────────────────────────

export function getSoundEnabled() {
  const v = localStorage.getItem(SOUND_KEY);
  return v === null ? true : v === 'true';
}

export function setSoundEnabled(on) {
  localStorage.setItem(SOUND_KEY, String(on));
}
