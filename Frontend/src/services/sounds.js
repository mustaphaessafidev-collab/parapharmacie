const SOUNDS = {
  orderSuccess: "/sounds/universfield-positive-notification-351299.mp3",
  newOrder: "/sounds/universfield-new-notification-051-494246.mp3",
  assignment: "/sounds/universfield-message-ping-351298.mp3",
};

const PREFERENCE_KEY = "atlaspara_sound";
const playedKey = (userId) => `atlaspara_played_sounds_${userId || "guest"}`;

let primed = null;
const queued = new Map();

export const soundEnabled = () => {
  try {
    return localStorage.getItem(PREFERENCE_KEY) !== "off";
  } catch {
    return true;
  }
};

export const setSoundEnabled = (enabled) => {
  localStorage.setItem(PREFERENCE_KEY, enabled ? "on" : "off");
  if (!enabled) {
    queued.clear();
    releasePrimed();
  }
};

export const readPlayedSounds = (userId) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(playedKey(userId)) || "[]");
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
};

export const rememberPlayedSound = (userId, id) => {
  const played = readPlayedSounds(userId);
  played.add(id);
  const values = [...played].slice(-200);
  localStorage.setItem(playedKey(userId), JSON.stringify(values));
  queued.delete(id);
};

export const primeSound = (src) => {
  if (!soundEnabled()) return;
  const audio = new Audio(src);
  audio.preload = "auto";
  audio.volume = 0;
  primed = { src, audio };
  const attempt = audio.play();
  if (attempt?.then) {
    attempt
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
      })
      .catch(() => {});
  }
};

export const releasePrimed = () => {
  if (!primed) return;
  primed.audio.pause();
  primed = null;
};

export const playSound = (src, id) => {
  if (!soundEnabled()) return Promise.resolve(false);
  const audio = primed?.src === src ? primed.audio : new Audio(src);
  if (primed?.src === src) primed = null;
  audio.volume = 0.7;
  try {
    audio.currentTime = 0;
  } catch {
    // The element may not have loaded yet.
  }
  return audio.play().then(() => true).catch(() => {
    if (id) queued.set(id, src);
    return false;
  });
};

export const flushQueuedSounds = () => {
  const entries = [...queued.entries()];
  queued.clear();
  return Promise.all(
    entries.map(([id, src]) => {
      const audio = new Audio(src);
      audio.volume = 0.7;
      return audio.play().then(() => id).catch(() => {
        queued.set(id, src);
        return null;
      });
    })
  ).then((ids) => ids.filter(Boolean));
};

export { SOUNDS };
