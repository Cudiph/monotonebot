const { setEmbedPlaying } = require('./embed.js');
const ytdl = require('ytdl-core-discord');
const { oneLine } = require('common-tags');

/**
 * Play a music and repeat if has another music to be played
 * @param {CommandoMessage} msg message from textchannel
 */
async function play(msg, numberOfTry = 0) {
  let queue = msg.guild.queue;
  let index = msg.guild.indexQueue;

  // if someone use jump -100 for example, so it'll reset to zero
  if (index < 0) {
    index = msg.guild.indexQueue = 0;
  } else if (queue && index >= queue.length) {
    index = msg.guild.indexQueue = msg.guild.queue.length;
  }
  // check if the queue is empty
  if (!queue || !queue.length) {
    return msg.channel.send('Stopped Playing...');
  }

  // if queue is in the end then check if the autoplay
  // is on, if not then return a message
  if (index === msg.guild.queue.length) {
    if (msg.guild.autoplay) {
      let related;
      try {
        related = (await ytdl.getInfo(queue[index - 1].link)).related_videos
          .filter(video => video.length_seconds < 2000);
        // if no related video then stop and give the message
        if (!related.length) {
          return msg.channel.send(oneLine`
            No related video were found. You can request again
            with \`${msg.guild.commandPrefix}skip\` command
          `)
        }
      } catch (err) {
        // try again
        if (numberOfTry < 15) {
          return play(msg, ++numberOfTry);
        }
        logger.log('error', err + ' at info');
        msg.say('Something went wrong. Current track will be skipped');
        msg.guild.indexQueue++;
        return play(msg);
      }
      const randTrack = Math.floor(Math.random() * related.length);
      const construction = {
        title: related[randTrack].title,
        link: `https://youtube.com/watch?v=${related[randTrack].id}`,
        uploader: related[randTrack].author,
        seconds: parseInt(related[randTrack].length_seconds),
        author: `Autoplay`,
        videoId: related[randTrack].id,
      }
      msg.guild.queue.push(construction);
      return play(msg);
    }
    return msg.channel.send(`Stopped Playing...`);
  }

  try {
    let connection; // make a connection
    if (msg.guild.me.voice.connection) {
      connection = msg.guild.me.voice.connection;
    } else {
      connection = await msg.member.voice.channel.join();
      // delete queue cache when disconnected
      connection.on('disconnect', () => {
        msg.channel.stopTyping(true);
        delete msg.guild.queue;
        delete msg.guild.indexQueue;
      })
    }
    // start typing indicator to notice user
    msg.channel.startTyping();
    let dispatcher = await connection.play(await ytdl(queue[index].link, {
      filter: 'audioonly',
      quality: 'lowest'
    }), {
      type: 'opus',
      volume: msg.guild.volume || 0.5,
      highWaterMark: 200,
      bitrate: 'auto'
    });
    msg.channel.stopTyping(true);

    // give data when dispatcher start
    dispatcher.on('start', async () => {
      let nowPlaying = await msg.say({ embed: await setEmbedPlaying(msg) });
      // assign now playing embed message id to the queue object
      msg.guild.queue[index].embedId = nowPlaying.id;
    });

    // play next song when current song is finished
    dispatcher.on('finish', () => {
      // delete the now playing embed id when the track is finished
      msg.channel.messages.delete(msg.guild.queue[index].embedId);
      msg.guild.indexQueue++;
      return play(msg);
    });

    // skip current track if error occured
    dispatcher.on('error', err => {
      msg.channel.stopTyping(true);
      logger.log('error', err);
      msg.channel.send('An error occured. The current track will be skipped');
      msg.guild.indexQueue++;
      return play(msg);
    });
  } catch (err) {
    // Skip if any error after 15x trying
    msg.channel.stopTyping(true);
    // err.endsWith("metadata")
    if (numberOfTry < 15) {
      return play(msg, ++numberOfTry);
    }
    logger.log('error', err + ' at connection play after 15x trying');
    msg.say('Something went wrong. Current track will be skipped');
    msg.guild.indexQueue++;
    play(msg);
  }

}

/**
 * Push to the queue and play if not playing any music
 * @param {Object} data data of music fetched from yt-search
 * @param {CommandoMessage} message message from textchannel
 */
async function player(data, message, fromPlaylist = false) {
  const construction = {
    title: data.title,
    link: data.url,
    videoId: data.videoId,
    uploader: data.author.name,
    seconds: parseInt(data.seconds),
    author: `${message.author.username}#${message.author.discriminator}`,
  }
  if (!message.guild.queue) {
    try {
      message.guild.queue = [];
      message.guild.indexQueue = 0;
      await message.guild.queue.push(construction);
      return await play(message);
    } catch (err) {
      message.channel.send('Something went wrong');
      delete message.guild.queue;
      logger.log('error', err);
    }
  } else {
    oldLength = message.guild.queue.length;
    message.guild.queue.push(construction);
    if (!fromPlaylist) {
      message.channel.send(`${data.title} has been added to the queue.`)
        .then(msg => msg.delete({ timeout: 8000 }));
    }
    // if in the end of queue and the song is stopped then play the track
    if (message.guild.indexQueue > oldLength - 1) {
      return play(message);
    }
  }
}

module.exports = {
  play,
  player,
}