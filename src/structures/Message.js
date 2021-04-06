/* eslint-disable indent */
const { oneLine } = require('common-tags');
const { Structures, escapeMarkdown, resolveString, APIMessage } = require('discord.js');
const gtrans = require('node-gtrans');
const { guildSettingsSchema } = require('../util/schema.js');
const Util = require('../util/Util.js');

module.exports = Structures.extend('Message', Message => {
  class MonoMessage extends Message {
    constructor(...args) {
      super(...args);
    }

    async respond({ type = 'reply', content, options, lang, fromEdit = false }) {
      const shouldEdit = this.responses && !fromEdit;
      if (shouldEdit) {
        if (options && options.split && typeof options.split !== 'object') options.split = {};
      }

      if (type === 'reply' && this.channel.type === 'dm') type = 'plain';
      if (type !== 'direct') {
        if (this.guild && !this.channel.permissionsFor(this.client.user).has('SEND_MESSAGES')) {
          type = 'direct';
        }
      }

      content = resolveString(content);

      const splittedContent = content.split(' ');

      // too lazy to make json or whatever it used for i18n
      // A little bit broken when dealing with names because command name and variable name are translated
      if (content && type !== 'code' && this.guild?.language !== 'en') {
        const langCacheKey = `${this.guild.language}-${splittedContent[0]}-${content.length}`;
        if (!this.client.langCache.has(langCacheKey)) {
          try {
            content = content.replace(/```/g, '<jhghghggvyty>').replace(/``/g, '<defffgghhh>');
            content = await gtrans(content, { to: this.guild.language, content: ['t'] })
              .then(res => {
                return res.data.translated
                  .replace(/<jhghghggvyty> ?/g, '```')
                  .replace(/<defffgghhh>/g, '``')
                  .replace(/\s+(?=[^<]*>)/g, '')
                  .replace(/(\*+)\s*(.*?)\s*(\*+)/g, '$1$2$3');
              });
            this.client.langCache.set(langCacheKey, content);
          } catch (e) {
            content = content.replace(/<jhghghggvyty> ?/g, '```').replace(/<defffgghhh>/g, '``');
            logger.error(e);
          }
        } else {
          content = this.client.langCache.get(langCacheKey);
        }
      }

      switch (type) {
        case 'plain':
          if (!shouldEdit) return this.channel.send(content, options);
          return this.editCurrentResponse(channelIDOrDM(this.channel), { type, content, options });
        case 'reply':
          if (!shouldEdit) return this._originalReply(content, options);
          if (!options?.split?.prepend) options.split.prepend = `${this.author}, `;
          return this.editCurrentResponse(channelIDOrDM(this.channel), { type, content, options });
        case 'direct':
          if (!shouldEdit) return this.author.send(content, options);
          return this.editCurrentResponse('dm', { type, content, options });
        case 'code':
          if (!shouldEdit) return this.channel.send(content, options);
          if (options?.split) {
            if (!options.split.prepend) options.split.prepend = `\`\`\`${lang || ''}\n`;
            if (!options.split.append) options.split.append = '\n```';
          }
          content = `\`\`\`${lang || ''}\n${escapeMarkdown(content, true)}\n\`\`\``;
          return this.editCurrentResponse(channelIDOrDM(this.channel), { type, content, options });
        default:
          throw new RangeError(`Unknown response type "${type}".`);
      }
    }

    _originalReply(content, options) {
      return this.channel.send(
        content instanceof APIMessage
          ? content
          : APIMessage.transformOptions(content, options, { reply: this.member || this.author }),
      );
    }

    /**
     * send automatically when starting music
     */
    sendEmbedPlaying() {
      const music = this.guild.queue[this.guild.indexQueue];
      const embed = {
        color: parseInt(Util.randomHex(), 16),
        fields: [
          {
            name: `Playing track #${this.guild.indexQueue}`,
            value: `[${music.title}](${music.link}) `,
          }
        ],
        footer: {
          text: `🔊 ${this.guild.volume * 100} | ${music.isLive ? '• Live' : Util.toTimestamp(music.seconds)} | ${music.author}`
        }
      };
      return this.embed(embed);
    }

    /**
     * Create embed for ..play
     * @param {import('shoukaku').ShoukakuTrack[]} videoList - List of shoukakuTrack
     * @param {number} indexPage - A number from indexes to choose between list of object
     * @param {number} page - current page to show
     * @param {number} itemsPerPage - number of items to be showed in one page of embed
     * @returns {import('discord.js').MessageEmbed}
     */
    createEmbedPlay(videoList, indexPage, page, itemsPerPage) {
      const listLength = videoList.length;
      const embed = {
        color: 0x53bcfc,
        author: {
          name: this.author.tag,
          icon_url: this.author.displayAvatarURL(),
        },
        description: `React with emoji to select audio`,
        fields: [],
        footer: {
          text: `${page + 1}/${Math.ceil(listLength / itemsPerPage)}`,
        },
      };

      // if the page is last page then execute this code
      if ((page + 1) === Math.ceil(listLength / itemsPerPage)) {
        for (let i = indexPage; i < listLength; i++) {
          embed.fields.push({
            name: `[${i % itemsPerPage + 1}] ${videoList[i].info.title}`,
            value: `Uploaded by ${videoList[i].info.author} | ${Util.toTimestamp(videoList[i].info.length / 1000)}`,
          });
        }
      } else {
        for (let i = indexPage; i < (itemsPerPage + indexPage); i++) {
          embed.fields.push({
            name: `[${i % itemsPerPage + 1}] ${videoList[i].info.title}`,
            value: `Uploaded by ${videoList[i].info.author} | ${Util.toTimestamp(videoList[i].info.length / 1000)}`,
          });
        }
      }
      return embed;
    }

    /**
     * Create embed for ..queue
     * @param {number} indexPage - number for indexing queue items
     * @param {number} page - for showing current page in embed
     * @param {number} itemsPerPage - number of items to be showed in one page of embed
     * @returns {import('discord.js').MessageEmbed}
     */
    createEmbedQueue(indexPage, page, itemsPerPage) {
      const queue = this.guild.queue;
      const listLength = queue.length;
      const embed = {
        color: parseInt(Util.randomHex(), 16),
        title: `Queue of ${this.guild.name}`,
        description: `Use react to switch between page`,
        fields: [],
        timestamp: new Date(),
        footer: {
          text: `${page}/${Math.ceil(listLength / itemsPerPage)}`,
        },
      };

      // if page is the last page then exec this code
      if (page === Math.ceil(listLength / itemsPerPage)) {
        for (let i = indexPage; i < listLength; i++) {
          // add => sign to current playing
          if (i !== this.guild.indexQueue) {
            embed.fields.push({
              name: `[${i}] ${queue[i].title}`,
              value: oneLine`
                ${queue[i].uploader} |
                ${queue[i].seconds ? Util.toTimestamp(queue[i].seconds) : queue[i].isLive ? '| • Live' : ''} |
                [${queue[i].link.includes('youtube.com/') ? 'Youtube' : 'Soundcloud'}](${queue[i].link})`,
            });
          } else {
            embed.fields.push({
              name: `=> [${i}] ${queue[i].title}`,
              value: oneLine`
                ${queue[i].uploader} |
                ${queue[i].seconds ? Util.toTimestamp(queue[i].seconds) : queue[i].isLive ? '| • Live' : ''} |
                [${queue[i].link.includes('youtube.com/') ? 'Youtube' : 'Soundcloud'}](${queue[i].link})`,
            });
          }

        }
      } else {
        for (let i = indexPage; i < (itemsPerPage + indexPage); i++) {
          if (i !== this.guild.indexQueue) {
            embed.fields.push({
              name: `[${i}] ${queue[i].title}`,
              value: oneLine`
                ${queue[i].uploader} |
                ${queue[i].seconds ? Util.toTimestamp(queue[i].seconds) : queue[i].isLive ? '| • Live' : ''} |
                [${queue[i].link.includes('youtube.com/') ? 'Youtube' : 'Soundcloud'}](${queue[i].link})`,
            });
          } else {
            embed.fields.push({
              name: `=> [${i}] ${queue[i].title}`,
              value: oneLine`
                ${queue[i].uploader} |
                ${queue[i].seconds ? Util.toTimestamp(queue[i].seconds) : queue[i].isLive ? '| • Live' : ''} |
                [${queue[i].link.includes('youtube.com/') ? 'Youtube' : 'Soundcloud'}](${queue[i].link})`,
            });
          }
        }
      }
      let qlength = 0;
      queue.forEach(obj => qlength += obj.seconds);

      embed.fields.push(
        {
          name: `Total Tracks`,
          value: `${queue.length}`,
          inline: true,
        },
        {
          name: `Length`,
          value: `${Util.toTimestamp(qlength)}`,
          inline: true,
        },
        {
          name: `Shuffle`,
          value: `${this.guild.shuffle ? '✅' : '❌'}`,
          inline: true,
        }
      );
      return embed;
    }

    /**
     * Log to logchannel for moderation commands if any, otherwise send to this channel
     * @param {Object} [options] - embed or string message
     */
    async sendToLogChan({ embedMsg, strMsg }) {
      const guildSetting = await guildSettingsSchema.findOne({ guildID: this.guild.id });
      const logChan = guildSetting ? this.guild.channels.cache.get(guildSetting.logChannelId) : false;
      if (embedMsg) {
        if (logChan?.permissionsFor(this.guild.me.id).has('SEND_MESSAGES')) {
          logChan.send({ embed: embedMsg });
        } else {
          return this.embed(embedMsg);
        }
      } else if (strMsg) {
        if (logChan?.permissionsFor(this.guild.me.id).has('SEND_MESSAGES')) {
          logChan.send(strMsg);
        } else {
          return this.say(strMsg);
        }
      }

    }

    /**
     * send and delete the message for a short amount of time
     * @param {ResolvableString} content
     * @param {MessageOptions} options
     */
    said(content, options, timeout = 1e4) {
      this.say(content, options).then(msg => msg.delete({ timeout })).catch(e => e);
    }

  }

  return MonoMessage;
});


function channelIDOrDM(channel) {
  if (channel.type !== 'dm') return channel.id;
  return 'dm';
}
