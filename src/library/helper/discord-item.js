const emoji = {
  a: '🇦', b: '🇧', c: '🇨', d: '🇩',
  e: '🇪', f: '🇫', g: '🇬', h: '🇭',
  i: '🇮', j: '🇯', k: '🇰', l: '🇱',
  m: '🇲', n: '🇳', o: '🇴', p: '🇵',
  q: '🇶', r: '🇷', s: '🇸', t: '🇹',
  u: '🇺', v: '🇻', w: '🇼', x: '🇽',
  y: '🇾', z: '🇿', 0: '0️⃣', 1: '1️⃣',
  2: '2️⃣', 3: '3️⃣', 4: '4️⃣', 5: '5️⃣',
  6: '6️⃣', 7: '7️⃣', 8: '8️⃣', 9: '9️⃣',
  10: '🔟', '#': '#️⃣', '*': '*️⃣',
  '!': '❗', '?': '❓', 100: '💯',
  exit: '❌', circle: '⭕', check: '☑',
  rightA: '➡', leftA: '⬅', downUp: '⬇⬆',
  like: '👍', dislike: '👎', cloud: '☁',
  rainbow: '🌈', umbrella: '☂', heart: '❤',
  blackHeart: '🖤', ok: '🆗', squaredX: '❎'
}

function randomHex() {
  return Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
}

function toTimestamp(second) {
  if (second > 3599) {
    return new Date(second * 1000).toISOString().substr(11, 8);
  } else {
    return new Date(second * 1000).toISOString().substr(14, 5);
  }
}

module.exports = {
  emoji,
  randomHex,
  toTimestamp,
};
