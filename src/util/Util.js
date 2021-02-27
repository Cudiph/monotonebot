/** Contains various general-purpose utility methods. */
class Util {
  constructor() {
    throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
  }

  static emoji = {
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
  };

  /**
   * generate random 6 digit hex
   * @returns {string}
   */
  static randomHex() {
    return Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
  }

  /**
   * Change seconds to timestamp like '04:20:46'
   * @param {string} seconds seconds in numbers
   */
  static toTimestamp(seconds) {
    if (seconds >= 86400) {
      const day = Math.floor(seconds / 86400);
      return day.toString().padStart(2, '0') + ':' + new Date(seconds * 1000).toISOString().substr(11, 8);
    } else if (seconds > 3599) {
      return new Date(seconds * 1000).toISOString().substr(11, 8);
    } else {
      return new Date(seconds * 1000).toISOString().substr(14, 5);
    }
  }

  /**
   * change timestamps to seconds format like 3600
   * @param {number} timestamp String from timestamp like 10:00:00
   */
  static toSeconds(timestamp) {
    if (timestamp.endsWith(':')) {
      timestamp += '0';
    }
    // reverse the splitted timestamp from 10:00:00 to ['00','00','10']
    // so it start from secs, mins, hours
    const timeList = timestamp.split(/\s*:\s*/).reverse();
    let seconds = 0;
    for (let i = 0; i < timeList.length; i++) {
      if (i === 0) {
        seconds += parseInt(timeList[i]);
      } else if (i < 3) {
        seconds += parseInt(timeList[i]) * 60 ** i;
      } else {
        seconds += parseInt(timeList[i]) * 86400;
      }
    }
    return seconds;
  }
}

module.exports = Util;
