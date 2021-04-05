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
  * @property {string} track - The base64 track from the lavalink Rest API
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

      /**
       * Player volume
       * @type {number}
       */
      this.volume = 1;
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
    async _playStream(msg) {
      const queue = this.queue;
      const indexQ = this.indexQueue;

      try {
        /** @type {import('shoukaku').ShoukakuPlayer} */
        let player; // make a connection

        if (this.client.lavaku.getPlayer(msg.guild.id)) {
          player = this.client.lavaku.getPlayer(msg.guild.id);
        } else {
          const node = this.client.lavaku.getNode();
          player = await node.joinVoiceChannel({
            guildID: msg.guild.id,
            voiceChannelID: msg.member.voice.channelID,
          });

          player.on('nodeDisconnect', () => {
            msg.channel.stopTyping(true);
            this.resetPlayer();
          });

          // give data when dispatcher start
          player.on('start', async () => {
            const nowPlaying = await msg.sendEmbedPlaying().catch(e => e);
            // assign now playing embed message id to the queue object
            this.playingEmbedID = nowPlaying.id;
            msg.channel.stopTyping(true);
          });

          // play next song when current song is finished
          player.on('end', async (reason) => {
            if (reason.type !== 'TrackEndEvent') {
              msg.say(`An error occured. **Track #${this.indexQueue}** will be skipped`);
            }
            // delete the now playing embed when the track is finished
            await msg.channel.messages.delete(this.playingEmbedID).catch(e => e);
            this.indexQueue++;
            return this.play(msg);
          });

          // skip current track if error occured
          player.on('error', err => {
            msg.channel.stopTyping(true);
            logger.error(err);
            msg.say(`An error occured. **Track #${this.indexQueue}** will be skipped`);
            this.indexQueue++;
            return this.play(msg);
          });

          player.on('closed', () => {
            msg.channel.messages.delete(this.playingEmbedID).catch(e => e);
            msg.channel.stopTyping(true);
            this.resetPlayer();
            player.disconnect();
          });
        }

        // start typing indicator to notice user
        msg.channel.startTyping();
        await player.playTrack(queue[indexQ].track);

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

      /** @type {import('shoukaku').ShoukakuTrackList} */
      const res = await this.client.lavaku.getNode().rest.resolve(related[randTrack].id);

      const construction = {
        title: related[randTrack].title,
        link: res.tracks[0].info.uri,
        uploader: related[randTrack].author.name || 'unknown',
        seconds: parseInt(related[randTrack].length_seconds),
        author: `Autoplay`,
        videoId: related[randTrack].id,
        isLive: res.tracks[0].info.isStream,
        track: res.tracks[0].track,
      };
      this.queue.push(construction);
      this.queueTemp.push(construction);
      return this.play(msg);
    }

    /**
     * Handler before a track is played
     * @async
     * @param {import("discord.js-commando").CommandoMessage} msg
     */
    async play(msg) {
      const queue = this.queue;
      let indexQ = this.indexQueue;

      // handle the indexQueue
      if (indexQ < 0) {
        indexQ = this.indexQueue = 0;
      } else if (queue && indexQ >= queue.length) {
        indexQ = this.indexQueue = this.queue.length;
      }

      // check if the queue is empty
      if (!queue?.length) {
        return msg.say('Stopped Playing...');
      }

      // loop
      if (this.loop) {
        if (this.indexQueue === 0) {
          return this._playStream(msg);
        }
        this.indexQueue--;
        return this._playStream(msg);
      }

      // autoplay
      if (this.indexQueue === queue.length) {
        // prioritize autoplay over loopqueue
        if (this.autoplay) return this._fetchAutoplay(msg);
        else if (this.loopQueue) this.indexQueue = 0;
        else return msg.say(`Stopped Playing...`);
      }

      return this._playStream(msg);

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
        track: data.track,
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
