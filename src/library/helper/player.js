const { setEmbedPlaying } = require('./embed.js');
const ytdl = require('discord-ytdl-core');
const { oneLine, stripIndents } = require('common-tags');

/**
 * @typedef {Object[]} PushedQueue
 * @property {string} title - Title of the track
 * @property {string} link - url of the track
 * @property {string} videoId - videoId of the track
 * @property {string} uploader - uploader of the track
 * @property {number} seconds - Duration of the track
 * @property {string} author - Name of discord account who requested the song
 * @property {boolean} isLive - whether the video is in livestream or not
 */

/**
 * Play a track
 * @param {import("discord.js-commando").CommandoMessage} msg - msg
 * @param {number} [seek=0] - a number in seconds to seek
 * @returns {void}
 */
async function playStream(msg, seek = 0) {
  const queue = msg.guild.queue;
  const indexQ = msg.guild.indexQueue;

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
        delete msg.guild.queueTemp;
        msg.guild.autoplay = false;
        msg.guild.loop = false;
        msg.guild.shuffle = false;
        msg.guild.loopQueue = false;
      });
    }
    if (seek) {
      msg.guild.queue[indexQ].seekTime = seek;
    }
    // start typing indicator to notice user
    msg.channel.startTyping();
    const url = `https://www.youtube.com/watch?v=${queue[indexQ].videoId}`;
    const stream = ytdl(queue[indexQ].link || url, {
      filter: queue[indexQ].isLive ? 'audio' : 'audioonly',
      quality: queue[indexQ].isLive ? [91, 92, 93, 94] : 'highest',
      dlChunkSize: 0,
      opusEncoded: true,
      encoderArgs: ['-af', 'bass=g=10,dynaudnorm=f=200'],
      seek: seek,
    });
    const dispatcher = connection.play(stream, {
      type: 'opus',
      volume: msg.guild.volume || 0.5,
      highWaterMark: 200,
      bitrate: 'auto'
    });
    msg.channel.stopTyping(true);

    // give data when dispatcher start
    dispatcher.on('start', async () => {
      const nowPlaying = await msg.say({ embed: await setEmbedPlaying(msg) });
      // assign now playing embed message id to the queue object
      msg.guild.queue[indexQ].embedId = nowPlaying.id;
      msg.channel.stopTyping(true);
    });

    // play next song when current song is finished
    dispatcher.on('finish', () => {
      // delete the now playing embed when the track is finished
      if (msg.guild.queue && msg.guild.queue[indexQ]) {
        msg.channel.messages.delete(msg.guild.queue[indexQ].embedId)
          .catch(e => e);
      }
      msg.guild.indexQueue++;
      return play(msg);
    });

    // skip current track if error occured
    dispatcher.on('error', err => {
      msg.channel.stopTyping(true);
      logger.log('error', err.stack);
      msg.say(`An error occured. **Track #${msg.guild.indexQueue}** will be skipped`);
      msg.guild.indexQueue++;
      return play(msg);
    });
  } catch (err) {
    msg.channel.stopTyping(true);
    logger.log('error', err.stack);
    msg.say(`Something went wrong. **Track #${msg.guild.indexQueue}** will be skipped`);
    msg.guild.indexQueue++;
    play(msg);
  }
}

/**
 * Function to fetch related track
 * @param {import("discord.js-commando").CommandoMessage} msg - msg
 * @returns {any}
 */
async function fetchAutoplay(msg) {
  const queue = msg.guild.queue;
  const indexQ = msg.guild.indexQueue;
  if (queue && queue.length > 150) {
    return msg.say(oneLine`
      You reached maximum number of track.
      Please clear the queue first with **\`${msg.guild.commandPrefix}stop 1\`**.
    `);
  }
  let related;
  try {
    let url;
    if (indexQ === 0) {
      url = queue[indexQ].link || queue[indexQ].videoId;
    } else {
      url = queue[indexQ - 1].link || queue[indexQ - 1].videoId || queue[indexQ - 2].link || queue[indexQ - 2].videoId;
    }
    related = (await ytdl.getBasicInfo(url)).related_videos
      .filter(video => video.length_seconds < 2000);
    // if no related video then stop and give the message
    if (!related.length) {
      return msg.say(stripIndents`
        No related video were found. You can request again with \`${msg.guild.commandPrefix}skip\` command. 
        Videos with a duration longer than 40 minutes will not be listed.
      `);
    }
  } catch (err) {
    logger.log('error', err.stack);
    msg.say(`Something went wrong. You can try again with \`${msg.guild.commandPrefix}skip\` command.`);
    msg.guild.indexQueue++;
    return;
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
  };
  msg.guild.queue.push(construction);
  if (msg.guild.queueTemp) msg.guild.queueTemp.push(construction);
  return play(msg);
}

/**
 * Handler to voice stream related command
 * @async
 * @returns {any}
 * @param {import("discord.js-commando").CommandoMessage} msg - message from textchannel
 * @param {boolean} msg.guild.autoplay - the state of the autoplay
 * @param {number} msg.guild.indexQueue - current playing track
 * @param {PushedQueue} msg.guild.queue - queue of the guild
 * @param {Object} [options] - Option
 * @param {number} [options.seek=0] - a number in seconds to seek
 */
async function play(msg, options = {}) {
  if (typeof options !== 'object') throw new TypeError('INVALID_TYPE');
  const { seek = 0 } = options;

  const queue = msg.guild.queue;
  let indexQ = msg.guild.indexQueue;

  // handle the indexQueue
  if (indexQ < 0) {
    indexQ = msg.guild.indexQueue = 0;
  } else if (queue && indexQ >= queue.length) {
    indexQ = msg.guild.indexQueue = msg.guild.queue.length;
  }

  // check if the queue is empty
  if (!queue || !queue.length) {
    return msg.say('Stopped Playing...');
  }

  // loop
  if (msg.guild.loop) {
    if (seek) {
      return playStream(msg, seek);
    }
    if (msg.guild.indexQueue === 0) {
      return playStream(msg, seek);
    }
    msg.guild.indexQueue--;
    return playStream(msg, seek);
  }

  // autoplay
  if (msg.guild.indexQueue === queue.length) {
    // prioritize autoplay over loopqueue
    if (msg.guild.autoplay) return fetchAutoplay(msg);
    else if (msg.guild.loopQueue) msg.guild.indexQueue = 0;
    else return msg.say(`Stopped Playing...`);
  }

  return playStream(msg, seek);

}

/**
 * @typedef {Object} QueueConstructor
 * @property {string} title - title of the track
 * @property {string} url - full youtube url of the track
 * @property {string} videoId - unique track's video ID
 * @property {Object} uploader - Information about the uploader of the track
 * @property {string} uploader.name - Channel name who upload the video
 * @property {number} seconds - length of the video
 * @property {string} author - the author who requested the track
 * @property {boolean} isLive - whether the video is on livestream
 */

/**
 * Processing data before something pushed to the guild queue
 * @async
 * @param {QueueConstructor} data - data of music fetched from yt-search
 * @param {import("discord.js-commando").CommandoMessage} msg - message from textchannel
 * @param {boolean} fromPlaylist - whether player is called from playlist.js or called multiple times
 * @returns {play}
 */
function player(data = {}, msg, fromPlaylist = false) {
  if (msg.guild.queue && msg.guild.queue.length > 150) {
    return msg.say(oneLine`
    You reached maximum number of track.
    Please clear the queue first with **\`${msg.guild.commandPrefix}stop 1\`**.
    `);
  }
  const construction = {
    title: data.title,
    link: data.url,
    videoId: data.videoId,
    uploader: data.author.name || 'Unknown',
    seconds: parseInt(data.seconds),
    author: `${msg.author.username}#${msg.author.discriminator}`,
    isLive: data.isLive,
  };
  if (!msg.guild.queue) {
    try {
      msg.guild.queue = [];
      msg.guild.indexQueue = 0;
      msg.guild.queue.push(construction);
      return play(msg);
    } catch (err) {
      msg.say('Something went wrong');
      delete msg.guild.queue;
      logger.log('error', err);
    }
  } else {
    const oldLength = msg.guild.queue.length;
    msg.guild.queue.push(construction);
    if (!fromPlaylist) {
      msg.say(`**${data.title}** has been added to the queue.`)
        .then(resMsg => resMsg.delete({ timeout: 8000 }))
        .catch(e => e);
    }
    // if in the end of queue and the song is stopped then play the track
    if (msg.guild.indexQueue >= oldLength) play(msg);
  }
  if (msg.guild.queueTemp) msg.guild.queueTemp.push(construction);

}

module.exports = {
  play,
  player,
};
