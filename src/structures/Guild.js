const { Structures } = require('discord.js');
const ytdl = require('discord-ytdl-core');
const { oneLine, stripIndents } = require('common-tags');

/**
  * @typedef {Object} QueueObject
  * @property {string} title - Title of the track
  * @property {string} link - Full URL of the track
  * @property {string} videoId - Youtube unique videoId of the track
  * @property {string} uploader - Uploader of the track
  * @property {number|string} seconds - Duration of the track
  * @property {string} author - Name of discord account who requested the song
  * @property {boolean} isLive - Whether the video is in livestream or not
  * @property {?number} seekTime - seek value to use in seek command
 */

module.exports = Structures.extend('Guild', Guild => {

  class MonoGuild extends Guild {
    constructor(...args) {
      super(...args);

      /**
       * guild queue
       * @type {QueueObject[]}
       */
      this.queue = [];

      /**
       * pointer to element of the guild queue
       * @type {number}
       */
      this.indexQueue = 0;

      /**
       * temporary queue if user want to bring back unshuffled queue
       * @type {QueueObject[]}
       */
      this.queueTemp = [];

      /**
       * loop state
       * @type {boolean}
       */
      this.loop = false;

      /**
       * autoplay state
       * @type {Boolean}
       */
      this.autoplay = false;

      /**
       * shuffle state
       * @type {boolean}
       */
      this.shuffle = false;

      /**
       * loopQueue state
       * @type {boolean}
       */
      this.loopQueue = false;

      /**
       * language to respond
       * @type {string}
       */
      this.language = 'en';

      /**
       * Now playing embed ID
       * @type {?string}
       */
      this.playingEmbedID = null;

      /**
       * Cached state
       * @type {boolean}
       */
      this.isCached = false;
    }

    resetPlayer() {
      this.queue = [];
      this.queueTemp = [];
      this.indexQueue = 0;
      this.loop = false;
      this.autoplay = false;
      this.shuffle = false;
      this.loopQueue = false;
    }

    /**
     * Play a track
     * @param {import("discord.js-commando").CommandoMessage} msg - msg
     * @param {number} [seek=0] - a number in seconds to seek
     * @returns {void}
     */
    async _playStream(msg, seek = 0) {
      const queue = this.queue;
      const indexQ = this.indexQueue;

      try {
        let connection; // make a connection
        if (this.me.voice.connection) {
          connection = this.me.voice.connection;
        } else {
          connection = await msg.member.voice.channel.join();
          // delete queue cache when disconnected
          connection.on('disconnect', () => {
            msg.channel.stopTyping(true);
            this.resetPlayer();
            msg.channel.messages.delete(this.playingEmbedID).catch(e => e);
          });
        }
        if (seek) {
          this.queue[indexQ].seekTime = seek;
        }
        // start typing indicator to notice user
        msg.channel.startTyping();
        const url = `https://www.youtube.com/watch?v=${queue[indexQ].videoId}`;
        const stream = ytdl(queue[indexQ].link || url, {
          filter: queue[indexQ].isLive ? 'audio' : 'audioonly',
          quality: queue[indexQ].isLive ? [ 249, 250, 91, 92, 93, 94, 251] : 'highest',
          dlChunkSize: 0,
          opusEncoded: true,
          encoderArgs: ['-af', 'bass=g=10,dynaudnorm=f=200'],
          seek: seek,
        });
        const dispatcher = connection.play(stream, {
          type: 'opus',
          volume: this.volume || 0.5,
          highWaterMark: 200,
          bitrate: 'auto'
        });
        msg.channel.stopTyping(true);

        // give data when dispatcher start
        dispatcher.on('start', async () => {
          const nowPlaying = await msg.sendEmbedPlaying().catch(e => e);
          // assign now playing embed message id to the queue object
          this.playingEmbedID = nowPlaying.id;
          msg.channel.stopTyping(true);
        });

        // play next song when current song is finished
        dispatcher.on('finish', () => {
          // delete the now playing embed when the track is finished
          msg.channel.messages.delete(this.playingEmbedID).catch(e => e);
          this.indexQueue++;
          return this.play(msg);
        });

        // skip current track if error occured
        dispatcher.on('error', err => {
          msg.channel.stopTyping(true);
          logger.error(err.stack);
          msg.say(`An error occured. **Track #${this.indexQueue}** will be skipped`);
          this.indexQueue++;
          return this.play(msg);
        });
      } catch (err) {
        msg.channel.stopTyping(true);
        logger.error(err.stack);
        msg.say(`Something went wrong. **Track #${this.indexQueue}** will be skipped`);
        this.indexQueue++;
        this.play(msg);
      }
    }

    /**
     * Function to fetch related track
     * @param {import("discord.js-commando").CommandoMessage} msg - msg
     * @returns {any}
     */
    async _fetchAutoplay(msg) {
      const queue = this.queue;
      const indexQ = this.indexQueue;
      if (queue && queue.length > 150) {
        return msg.say(oneLine`
          You reached maximum number of track.
          Please clear the queue first with **\`${this.commandPrefix}stop 1\`**.
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
            No related video were found. You can request again with \`${this.commandPrefix}skip\` command. 
            Videos with a duration longer than 40 minutes will not be listed.
          `);
        }
      } catch (err) {
        logger.error(err.stack);
        msg.say(`Something went wrong. You can try again with \`${this.commandPrefix}skip\` command.`);
        this.indexQueue++;
        return;
      }
      const randTrack = related.length >= 5 ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * related.length);
      const construction = {
        title: related[randTrack].title,
        link: `https://youtube.com/watch?v=${related[randTrack].id}`,
        uploader: related[randTrack].author.name || 'unknown',
        seconds: parseInt(related[randTrack].length_seconds),
        author: `Autoplay`,
        videoId: related[randTrack].id,
        isLive: parseInt(related[randTrack].length_seconds) == 0 ? true : false,
      };
      this.queue.push(construction);
      this.queueTemp.push(construction);
      return this.play(msg);
    }

    /**
     * Handler before a track is played
     * @async
     * @param {import("discord.js-commando").CommandoMessage} msg
     * @param {Object} [options]
     * @param {number} [options.seek=0] - a number in seconds to seek
     */
    async play(msg, options = {}) {
      if (typeof options !== 'object') throw new TypeError('INVALID_TYPE');
      const { seek = 0 } = options;

      const queue = this.queue;
      let indexQ = this.indexQueue;

      // handle the indexQueue
      if (indexQ < 0) {
        indexQ = this.indexQueue = 0;
      } else if (queue && indexQ >= queue.length) {
        indexQ = this.indexQueue = this.queue.length;
      }

      // check if the queue is empty
      if (!queue || !queue.length) {
        return msg.say('Stopped Playing...');
      }

      // loop
      if (this.loop) {
        if (seek) {
          return this._playStream(msg, seek);
        }
        if (this.indexQueue === 0) {
          return this._playStream(msg, seek);
        }
        this.indexQueue--;
        return this._playStream(msg, seek);
      }

      // autoplay
      if (this.indexQueue === queue.length) {
        // prioritize autoplay over loopqueue
        if (this.autoplay) return this._fetchAutoplay(msg);
        else if (this.loopQueue) this.indexQueue = 0;
        else return msg.say(`Stopped Playing...`);
      }

      return this._playStream(msg, seek);

    }

    /**
     * Processing data before something pushed to the guild queue
     * @async
     * @param {QueueObject} data - data of music fetched from yt-search
     * @param {import("discord.js-commando").CommandoMessage} msg - message from textchannel
     * @param {boolean} fromPlaylist - whether player is called from playlist.js or called multiple times
     * @returns {play}
     */
    pushToQueue(data = {}, msg, fromPlaylist = false) {
      if (this.queue && this.queue.length > 150) {
        return msg.say(oneLine`
          You reached maximum number of track.
          Please clear the queue first with **\`${this.commandPrefix}stop 1\`**.
        `);
      }
      const construction = {
        title: data.title,
        link: data.link,
        videoId: data.videoId,
        uploader: data.uploader || 'Unknown',
        seconds: parseInt(data.seconds),
        author: data.author,
        isLive: data.isLive,
      };
      if (!this.queue.length) {
        try {
          this.queue.push(construction);
          return this.play(msg);
        } catch (err) {
          msg.say('Something went wrong');
          delete this.queue;
          logger.error(err.stack);
        }
      } else {
        const oldLength = this.queue.length;
        this.queue.push(construction);
        if (!fromPlaylist) {
          msg.say(`**${data.title}** has been added to the queue.`)
            .then(resMsg => resMsg.delete({ timeout: 8000 }))
            .catch(e => e);
        }
        // if in the end of queue and the song is stopped then play the track
        if (this.indexQueue >= oldLength) this.play(msg);
      }
      this.queueTemp.push(construction);

    }

    /**
     * Shuffle queue array using Durstenfeld shuffle
     * @see {@link https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array}
     */
    shuffleQueue() {
      for (let i = this.queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
      }
    }


  }

  return MonoGuild;
});
