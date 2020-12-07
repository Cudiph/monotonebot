const { setEmbedPlaying } = require('./embed.js');
const ytdl = require('discord-ytdl-core');
const { oneLine, stripIndents } = require('common-tags');

/**
 * Play a music and repeat if has another music to be played
 * @param {CommandoMessage} msg message from textchannel
 * @param {boolean} msg.guild.autoplay the state of the autoplay
 * @param {Number} msg.guild.indexQueue current playing track
 * @param {Object[]} msg.guild.queue queue of the guild
 * @param {string} msg.guild.queue[].title Title of the track
 * @param {string} msg.guild.queue[].link url of the track
 * @param {string} msg.guild.queue[].videoId videoId of the track
 * @param {string} msg.guild.queue[].uploader uploader of the track
 * @param {Number} msg.guild.queue[].seconds Duration of the track
 * @param {string} msg.guild.queue[].author Name of discord account who requested the song
 * @param {boolean} msg.guild.queue[].isLive whether the video is in livestream or not
 * @param {Number} numberOfTry The attempt whenever the track is failed to play
 */
async function play(msg, numberOfTry = 0) {
  let queue = msg.guild.queue;
  let index = msg.guild.indexQueue;

  // handle the indexQueue
  if (index < 0) {
    index = msg.guild.indexQueue = 0;
  } else if (queue && index >= queue.length) {
    index = msg.guild.indexQueue = msg.guild.queue.length;
  }

  // check if the queue is empty
  if (!queue || !queue.length) {
    return msg.channel.send('Stopped Playing...');
  }

  // autoplay
  if (index === msg.guild.queue.length) {
    if (msg.guild.autoplay) {
      if (msg.guild.queue && msg.guild.queue.length > 150) {
        return msg.say(oneLine`
          You reached maximum number of track.
          Please clear the queue first with **\`${msg.guild.commandPrefix}stop 1\`**.
        `);
      }
      let related;
      try {
        const url = queue[index - 1].link || queue[index - 1].videoId || queue[index - 2].link || queue[index - 2].videoId;
        related = (await ytdl.getBasicInfo(url)).related_videos
          .filter(video => video.length_seconds < 2000);
        // if no related video then stop and give the message
        if (!related.length) {
          return msg.channel.send(stripIndents`
            No related video were found. You can request again with \`${msg.guild.commandPrefix}skip\` command. 
            Videos with a duration longer than 40 minutes will not be listed.
          `)
        }
      } catch (err) {
        // try again
        if (numberOfTry < 15) {
          return play(msg, ++numberOfTry);
        }
        logger.log('error', err + ' at info');
        msg.say(`Something went wrong. Try to resolve related track`);
        msg.guild.indexQueue++;
        return play(msg);
      }
      const randTrack = Math.floor(Math.random() * related.length);
      const construction = {
        title: related[randTrack].title,
        link: `https://youtube.com/watch?v=${related[randTrack].id}`,
        uploader: related[randTrack].author.name || 'unknown',
        seconds: parseInt(related[randTrack].length_seconds),
        author: `Autoplay`,
        videoId: related[randTrack].id,
        isLive: related[randTrack].isLive,
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
    const url = `https://www.youtube.com/watch?v=${queue[index].videoId}`
    const stream = await ytdl(queue[index].link || url, {
      filter: queue[index].isLive ? 'audio' : 'audioonly',
      quality: queue[index].isLive ? [91, 92, 93, 94] : 'highest',
      dlChunkSize: 0,
      opusEncoded: true,
      encoderArgs: ['-af', 'bass=g=10,dynaudnorm=f=200'],
    })
    let dispatcher = await connection.play(stream, {
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
      msg.channel.stopTyping(true);
    });

    // play next song when current song is finished
    dispatcher.on('finish', () => {
      // delete the now playing embed when the track is finished
      if (msg.guild.queue && msg.guild.queue[index]) {
        msg.channel.messages.delete(msg.guild.queue[index].embedId)
          .catch(e => logger.log('error', 'object in queue is maybe already deleted'))
      };
      msg.guild.indexQueue++;
      return play(msg);
    });

    // skip current track if error occured
    dispatcher.on('error', err => {
      msg.channel.stopTyping(true);
      logger.log('error', err);
      msg.channel.send(`An error occured. **Track #${msg.guild.indexQueue}** will be skipped`);
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
    msg.say(`Something went wrong. **Track #${msg.guild.indexQueue}** will be skipped`);
    msg.guild.indexQueue++;
    play(msg);
  }

}

/**
 * Push to the queue and play if not playing any music
 * @param {Object} data data of music fetched from yt-search
 * @param {string} data.title title of the track
 * @param {string} data.url full youtube url of the track
 * @param {string} data.videoId unique track's video ID
 * @param {Object} data.uploader Information about the uploader of the track
 * @param {CommandoMessage} message message from textchannel
 */
async function player(data = {}, msg, fromPlaylist = false) {
  if (msg.guild.queue && msg.guild.queue.length > 150) {
    return msg.say(oneLine`
    You reached maximum number of track.
    Please clear the queue first with **\`${msg.guild.commandPrefix}stop 1\`**.
    `)
  }
  const construction = {
    title: data.title,
    link: data.url,
    videoId: data.videoId,
    uploader: data.author.name || 'Unknown',
    seconds: parseInt(data.seconds),
    author: `${msg.author.username}#${msg.author.discriminator}`,
    isLive: data.isLive,
  }
  if (!msg.guild.queue) {
    try {
      msg.guild.queue = [];
      msg.guild.indexQueue = 0;
      await msg.guild.queue.push(construction);
      return await play(msg);
    } catch (err) {
      msg.channel.send('Something went wrong');
      delete msg.guild.queue;
      logger.log('error', err);
    }
  } else {
    const oldLength = msg.guild.queue.length;
    msg.guild.queue.push(construction);
    if (!fromPlaylist) {
      msg.channel.send(`${data.title} has been added to the queue.`)
        .then(msg => msg.delete({ timeout: 8000 }));
    }
    // if in the end of queue and the song is stopped then play the track
    if (msg.guild.indexQueue >= oldLength) {
      return play(msg);
    }
  }
}

module.exports = {
  play,
  player,
}