const { randomHex, toTimestamp } = require('./discord-item.js');
const ytdl = require('ytdl-core-discord');

/**
 * Play a music and repeat if has another music to be played
 * @param {CommandoMessage} msg message from textchannel
 */
async function play(msg) {
  let queue = msg.guild.queue;

  // if queue is null then delete the queue
  if (!queue || !queue.length) {
    return msg.channel.send(`Stopped Playing...`);
  }

  const connection = await msg.member.voice.channel.join();
  // make a stream dispatcher
  let dispatcher = await connection.play(await ytdl(queue[0].link, { filter: 'audioonly' }), { type: 'opus', volume: msg.guild.volume || 0.5 });

  connection.on('disconnect', () => {
    delete msg.guild.queue;
    delete msg.guild.playedQueue;
  })

  dispatcher.on('start', async () => {
    msg.channel.send('now playing\n' + queue[0].title + ` by ${queue[0].uploader}`).then(msg => {
      msg.delete({ timeout: queue[0].seconds * 1000 });
    });
  });

  dispatcher.on('finish', () => {
    let played = queue.shift();
    if (msg.guild.playedQueue) {
      msg.guild.playedQueue.push(played);
    }
    play(msg);
  });

  dispatcher.on('error', err => {
    logger.log('error', err);
    if (queue.length > 1) {
      msg.channel.send('An error occured. The current track will be skipped');
    }
    let played = queue.shift();
    if (msg.guild.playedQueue) {
      msg.guild.playedQueue.push(played);
    }
    play(msg);
  });
}

/**
 * Push to the queue and play if not playing a music
 * @param {Object} data data of music fetched from yt-search
 * @param {CommandoMessage} message message from textchannel
 */
async function player(data, message) {
  const construction = {
    title: data.title,
    link: data.url,
    uploader: data.author.name,
    seconds: parseInt(data.seconds),
    channel: message.channel
  }
  if (!message.guild.playedQueue) {
    message.guild.playedQueue = [];
  }
  if (!message.guild.queue || !message.guild.queue.length) {
    try {
      message.guild.queue = [];
      await message.guild.queue.push(construction);
      return play(message);
    } catch (err) {
      delete message.guild.queue;
      logger.log('error', err);
    }
  } else {
    message.guild.queue.push(construction);
    return message.channel.send(`${data.title} has been added to the queue.`)
      .then(msg => msg.delete({ timeout: 6000 }));
  }
}

/**
 * Setting up embed so you won't repeat it
 * @param {object} dataList data of music fetched from yt-search
 * @param {number} indexPage A number from indexes to choose between list of object
 * @param {number} page number of page now
 * @param {CommandoMessage} msg message from textchannel
 * @param {number} itemsPerPage number of items showed in one embed
 */
function setEmbedPlayCmd(dataList, indexPage, page, msg, itemsPerPage) {
  let listLength = dataList.length;
  let embed = {
    color: 0x53bcfc,
    author: {
      name: `@${msg.author.username}#${msg.author.discriminator}`,
      icon_url: msg.author.displayAvatarURL(),
    },
    description: `React with emoji to select audio`,
    fields: [],
    footer: {
      text: `${page + 1}/${Math.ceil(listLength / itemsPerPage)}`,
    },
  }

  if ((page + 1) === Math.ceil(listLength / itemsPerPage)) {
    for (let i = 0; i < (listLength - indexPage); i++) {
      embed.fields.push({
        name: `[${i + 1}] ${dataList[indexPage + i].title}`,
        value: `Uploaded by ${dataList[indexPage + i].author.name} | ${dataList[indexPage + i].timestamp}`,
      })
    }
  } else {
    for (let i = 0; i < itemsPerPage; i++) {
      embed.fields.push({
        name: `[${i + 1}] ${dataList[indexPage + i].title}`,
        value: `Uploaded by ${dataList[indexPage + i].author.name} | ${dataList[indexPage + i].timestamp}`,
      })
    }
  }
  return embed;
}

/**
 * Set embed for ..queue
 * @param {Array} dataList array of music queue from message.guild.queue + message.guild.playedQueue
 * @param {Number} indexPage number for indexing queue items
 * @param {Number} page for showing current page in embed
 * @param {CommandoMessage} msg message from user
 * @param {Number} itemsPerPage number of items showed in embed
 * @param {Array} played list of music queue for marking the current playing in embed
 */
function setEmbedQueueCmd(dataList, indexPage, page, msg, itemsPerPage, played) {
  let listLength = dataList.length;
  let embed = {
    color: parseInt(randomHex(), 16),
    title: `Queue of ${msg.guild.name}`,
    description: `Use react to switch between page`,
    fields: [],
    timestamp: new Date(),
    footer: {
      text: `${page + 1}/${Math.ceil(listLength / itemsPerPage)}`,
    },
  }

  if (page === Math.floor(listLength / itemsPerPage)) {
    for (let i = 0; i < (listLength - indexPage); i++) {
      if ((indexPage + i) !== played.length) {
        embed.fields.push({
          name: `[${indexPage + i + 1}] ${dataList[indexPage + i].title}`,
          value: `${dataList[indexPage + i].uploader} | ${toTimestamp(dataList[indexPage + i].seconds).substr(3)}`,
        })
      } else {
        embed.fields.push({
          name: `=> [${indexPage + i + 1}] ${dataList[indexPage + i].title}`,
          value: `${dataList[indexPage + i].uploader} | ${toTimestamp(dataList[indexPage + i].seconds).substr(3)}`,
        })
      }

    }
  } else {
    for (let i = 0; i < itemsPerPage; i++) {
      if ((indexPage + i) !== played.length) {
        embed.fields.push({
          name: `[${indexPage + i + 1}] ${dataList[indexPage + i].title}`,
          value: `${dataList[indexPage + i].uploader} | ${toTimestamp(dataList[indexPage + i].seconds).substr(3)}`,
        })
      } else {
        embed.fields.push({
          name: `=> [${indexPage + i + 1}] ${dataList[indexPage + i].title}`,
          value: `${dataList[indexPage + i].uploader} | ${toTimestamp(dataList[indexPage + i].seconds).substr(3)}`,
        })
      }
    }
  }
  return embed;
}

module.exports = {
  play,
  player,
  setEmbedPlayCmd,
  setEmbedQueueCmd,
}