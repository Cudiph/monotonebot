const { setEmbedPlaying } = require('./embed.js');
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

  // check if the queue is empty
  if (!queue || !queue.length) {
    return msg.channel.send('No song to be played')
  }
  // if queue is null then delete the queue
  if (index === queue.length) {
    if (msg.guild.autoplay) {
      let info = await ytdl.getBasicInfo(queue[index - 1].link);
      let related = info.related_videos[0];
      const construction = {
        title: related.title,
        link: `https://youtube.com/watch?v=${related.id}`,
        uploader: related.author,
        seconds: parseInt(related.length_seconds),
        author: `Autoplay`
      }
      msg.guild.queue.push(construction);
      return play(msg);
    }
    return msg.channel.send(`Stopped Playing...`);
  }

  let connection; // make a connection
  if (msg.guild.me.voice.connection) {
    connection = msg.guild.me.voice.connection;
  } else {
    connection = await msg.member.voice.channel.join();
  }
  msg.channel.startTyping();
  let dispatcher = await connection.play(await ytdl(queue[index].link, { filter: 'audioonly' }), { type: 'opus', volume: msg.guild.volume || 0.5 });
  msg.channel.stopTyping(true);
  // delete queue cache when disconnected
  connection.on('disconnect', () => {
    delete msg.guild.queue;
    delete msg.guild.indexQueue;
  })

  // give data when dispatcher start
  dispatcher.on('start', async () => {
    msg.channel.send({ embed: await setEmbedPlaying(msg) }).then(msg => {
      msg.delete({ timeout: queue[index].seconds * 1000 });
    });
  });

  // play next song when current song is finished
  dispatcher.on('finish', () => {
    msg.guild.indexQueue++;
    return play(msg);
  });

  // skip current track if error occured
  dispatcher.on('error', err => {
    logger.log('error', err);
    msg.channel.send('An error occured. The current track will be skipped');
    msg.guild.indexQueue++;
    return play(msg);
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
    author: `${message.author.username}#${message.author.discriminator}`
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

module.exports = {
  play,
  player,
}