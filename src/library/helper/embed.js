const { toTimestamp, randomHex } = require('./discord-item.js');
const { guildSettingsSchema } = require('../Database/schema.js');
/**
 * @typedef {Object[]} DataList
 * @property {string} title - Title of the track
 * @property {Object} author - Object of uploader information (yt-search only)
 * @property {string} author.name - Name of the channel (yt-search only)
 * @property {string} timestamp - Timestamp of the video (yt-search only)
 * @property {string} link - url of the track
 * @property {string} uploader - uploader of the track
 * @property {number} seconds - Duration of the track
 * @property {boolean} isLive - whether the video is in livestream or not
 */


/**
 * Property for a now playing embed
 * @param {import("discord.js-commando").CommandoMessage} msg message from text channel
 */
async function setEmbedPlaying(msg) {
  const music = msg.guild.queue[msg.guild.indexQueue];
  const embed = {
    color: parseInt(randomHex(), 16),
    fields: [
      {
        name: `Playing track #${msg.guild.indexQueue}`,
        value: `[${music.title}](${music.link}) `,
      }
    ],
    footer: {
      text: `🔊 ${msg.guild.volume * 100} | ${music.isLive ? '• Live' : toTimestamp(music.seconds)} | ${music.author}`
    }
  };
  return embed;
}

/**
 * Setting up embed so you won't repeat it
 * @param {DataList} dataList - array of music fetched from yt-search
 * @param {number} indexPage - A number from indexes to choose between list of object
 * @param {number} page - number of page now
 * @param {import("discord.js-commando").CommandoMessage} msg - message from textchannel
 * @param {number} itemsPerPage - number of items to be showed in one page of embed
 */
function setEmbedPlayCmd(dataList, indexPage, page, msg, itemsPerPage) {
  const listLength = dataList.length;
  const embed = {
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
  };

  // if the page is last page then execute this code
  if ((page + 1) === Math.ceil(listLength / itemsPerPage)) {
    for (let i = indexPage; i < listLength; i++) {
      embed.fields.push({
        name: `[${i % itemsPerPage + 1}] ${dataList[i].title}`,
        value: `Uploaded by ${dataList[i].author.name} | ${dataList[i].timestamp}`,
      });
    }
  } else {
    for (let i = indexPage; i < (itemsPerPage + indexPage); i++) {
      embed.fields.push({
        name: `[${i % itemsPerPage + 1}] ${dataList[i].title}`,
        value: `Uploaded by ${dataList[i].author.name} | ${dataList[i].timestamp}`,
      });
    }
  }
  return embed;
}

/**
 * Set embed for ..queue
 * @param {DataList} dataList - array of music queue from message.guild.queue
 * @param {number} indexPage - number for indexing queue items
 * @param {number} page - for showing current page in embed
 * @param {import("discord.js-commando").CommandoMessage} msg - message from user
 * @param {number} itemsPerPage - number of items to be showed in one page of embed
 */
function setEmbedQueueCmd(dataList, indexPage, page, msg, itemsPerPage) {
  const listLength = dataList.length;
  const embed = {
    color: parseInt(randomHex(), 16),
    title: `Queue of ${msg.guild.name}`,
    description: `Use react to switch between page`,
    fields: [],
    timestamp: new Date(),
    footer: {
      text: `${page + 1}/${Math.ceil(listLength / itemsPerPage)}`,
    },
  };

  // if page is the last page then exec this code
  if (page === Math.floor(listLength / itemsPerPage)) {
    for (let i = indexPage; i < listLength; i++) {
      // add => sign to current playing
      if (i !== msg.guild.indexQueue) {
        embed.fields.push({
          name: `[${i}] ${dataList[i].title}`,
          value: `${dataList[i].uploader} ${dataList[i].seconds ?
            '| ' + toTimestamp(dataList[i].seconds) : dataList[i].isLive ? '| • Live' : ''} | [YouTube](${dataList[i].link})`,
        });
      } else {
        embed.fields.push({
          name: `=> [${i}] ${dataList[i].title}`,
          value: `${dataList[i].uploader} ${dataList[i].seconds ?
            '| ' + toTimestamp(dataList[i].seconds) : dataList[i].isLive ? '| • Live' : ''} | [YouTube](${dataList[i].link})`,
        });
      }

    }
  } else {
    for (let i = indexPage; i < (itemsPerPage + indexPage); i++) {
      if (i !== msg.guild.indexQueue) {
        embed.fields.push({
          name: `[${i}] ${dataList[i].title}`,
          value: `${dataList[i].uploader} ${dataList[i].seconds ?
            '| ' + toTimestamp(dataList[i].seconds) : dataList[i].isLive ? '| • Live' : ''} | [YouTube](${dataList[i].link})`,
        });
      } else {
        embed.fields.push({
          name: `=> [${i}] ${dataList[i].title}`,
          value: `${dataList[i].uploader} ${dataList[i].seconds ?
            '| ' + toTimestamp(dataList[i].seconds) : dataList[i].isLive ? '| • Live' : ''} | [YouTube](${dataList[i].link})`,
        });
      }
    }
  }
  let qlength = 0;
  dataList.forEach(obj => qlength += obj.seconds);

  embed.fields.push(
    {
      name: `Volume`,
      value: `${msg.guild.volume * 100}`,
      inline: true,
    },
    {
      name: `Length`,
      value: `${toTimestamp(qlength)}`,
      inline: true,
    },
    {
      name: `Autoplay`,
      value: `${msg.guild.autoplay ? 'True' : 'False'}`,
      inline: true,
    }
  );
  return embed;
}

/**
 * Log to logchannel for moderation commands
 * @param {import("discord.js-commando").CommandoMessage} msg msg
 * @param {Object} options options
 * @param {import("discord.js").MessageEmbed} [options.embedMsg] embed msg to sent
 * @param {string} [options.strMsg] raw string to sent
 * @returns {import('discord.js').TextChannel}
 */
async function sendtoLogChan(msg, options = {}) {
  const { embedMsg, strMsg } = options;
  const guildSetting = await guildSettingsSchema.findOne({ guildId: msg.guild.id });
  const logChan = await msg.guild.channels.cache.get(guildSetting.logChannelId);
  if (embedMsg) {
    if (guildSetting.logChannelId && logChan) {
      logChan.send({ embed: embedMsg });
    } else {
      return msg.say({
        embed: embedMsg
      });
    }
  } else if (strMsg) {
    if (guildSetting.logChannelId && logChan) {
      logChan.send(strMsg);
    } else {
      return msg.say(strMsg);
    }
  }

}

module.exports = {
  setEmbedPlayCmd,
  setEmbedPlaying,
  setEmbedQueueCmd,
  sendtoLogChan,
};