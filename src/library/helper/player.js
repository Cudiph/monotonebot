const { randomHex, toTimestamp } = require('./discord-item.js');
const ytdl = require('ytdl-core-discord');

/**
 * Play a music and repeat if has another music to be played
 * @param {CommandoMessage} msg message from textchannel
 */
async function play(msg) {
  let queue = msg.guild.queue;
  let index = msg.guild.indexQueue;

  // if someone use jump -100 for example, so it'll reset to zero
  if (index < 0) {
    index = msg.guild.indexQueue = 0;
  }

  // if queue is null then delete the queue
  if (index === queue.length) {
    return msg.channel.send(`Stopped Playing...`);
  }

  let connection; // make a connection
  if (msg.guild.me.voice.connection) {
    connection = msg.guild.me.voice.connection;
  } else {
    connection = await msg.member.voice.channel.join();
  }

  let dispatcher = await connection.play(await ytdl(queue[index].link, { filter: 'audioonly' }), { type: 'opus', volume: msg.guild.volume || 0.5 });

  // delete queue cache when disconnected
  connection.on('disconnect', () => {
    delete msg.guild.queue;
    delete msg.guild.indexQueue;
  })

  // give data when dispatcher start
  dispatcher.on('start', async () => {
    msg.channel.send('now playing\n' + queue[index].title + ` by ${queue[index].uploader}`).then(msg => {
      msg.delete({ timeout: queue[index].seconds * 1000 });
    });
  });

  // play next song when current song is finished
  dispatcher.on('finish', () => {
    msg.guild.indexQueue++;
    play(msg);
  });

  // skip current track if error occured
  dispatcher.on('error', err => {
    logger.log('error', err);
    msg.channel.send('An error occured. The current track will be skipped');
    msg.guild.indexQueue++;
    play(msg);
  });
}

/**
 * Push to the queue and play if not playing any music
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
  if (!message.guild.queue) {
    try {
      message.guild.queue = [];
      message.guild.indexQueue = 0;
      await message.guild.queue.push(construction);
      return play(message);
    } catch (err) {
      message.channel.send('Something went wrong');
      delete message.guild.queue;
      logger.log('error', err);
    }
  } else {
    message.guild.queue.push(construction);
    message.channel.send(`${data.title} has been added to the queue.`)
      .then(msg => msg.delete({ timeout: 8000 }));
    if (!message.guild.me.voice.connection.dispatcher || message.guild.me.voice.connection.dispatcher.paused) {
      return play(message);
    }
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
 * @param {Array} dataList array of music queue from message.guild.queue
 * @param {Number} indexPage number for indexing queue items
 * @param {Number} page for showing current page in embed
 * @param {CommandoMessage} msg message from user
 * @param {Number} itemsPerPage number of items showed in embed
 * @param {Array} played list of music queue for marking the current playing in embed
 */
function setEmbedQueueCmd(dataList, indexPage, page, msg, itemsPerPage) {
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
      if ((indexPage + i) !== msg.guild.indexQueue) {
        embed.fields.push({
          name: `[${indexPage + i}] ${dataList[indexPage + i].title}`,
          value: `${dataList[indexPage + i].uploader} | ${toTimestamp(dataList[indexPage + i].seconds).substr(3)}`,
        })
      } else {
        embed.fields.push({
          name: `=> [${indexPage + i}] ${dataList[indexPage + i].title}`,
          value: `${dataList[indexPage + i].uploader} | ${toTimestamp(dataList[indexPage + i].seconds).substr(3)}`,
        })
      }

    }
  } else {
    for (let i = 0; i < itemsPerPage; i++) {
      if ((indexPage + i) !== msg.guild.indexQueue) {
        embed.fields.push({
          name: `[${indexPage + i}] ${dataList[indexPage + i].title}`,
          value: `${dataList[indexPage + i].uploader} | ${toTimestamp(dataList[indexPage + i].seconds).substr(3)}`,
        })
      } else {
        embed.fields.push({
          name: `=> [${indexPage + i}] ${dataList[indexPage + i].title}`,
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