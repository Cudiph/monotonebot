const { toTimestamp, randomHex } = require('./discord-item.js');
const { CommandoMessage } = require('discord.js-commando');

/**
 * Property for a now playing embed
 * @param {CommandoMessage} msg message from text channel
 */
async function setEmbedPlaying(msg) {
  let music = msg.guild.queue[msg.guild.indexQueue];
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
  }
  return embed;
}

/**
 * Setting up embed so you won't repeat it
 * @param {Object[]} dataList array of music fetched from yt-search
 * @param {string} dataList[].title Title of the video
 * @param {Object} dataList[].author Object of uploader information
 * @param {string} dataList[].author.name Name of the channel
 * @param {string} dataList[].timestamp Timestamp of the video
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

  // if the page is last page then execute this code
  if ((page + 1) === Math.ceil(listLength / itemsPerPage)) {
    for (let i = indexPage; i < listLength; i++) {
      embed.fields.push({
        name: `[${i % itemsPerPage + 1}] ${dataList[i].title}`,
        value: `Uploaded by ${dataList[i].author.name} | ${dataList[i].timestamp}`,
      })
    }
  } else {
    for (let i = indexPage; i < (itemsPerPage + indexPage); i++) {
      embed.fields.push({
        name: `[${i % itemsPerPage + 1}] ${dataList[i].title}`,
        value: `Uploaded by ${dataList[i].author.name} | ${dataList[i].timestamp}`,
      })
    }
  }
  return embed;
}

/**
 * Set embed for ..queue
 * @param {Object[]} dataList - array of music queue from message.guild.queue
 * @param {string} dataList[].title - Title of the track
 * @param {string} dataList[].link - url of the track
 * @param {string} dataList[].uploader uploader of the track
 * @param {number} dataList[].seconds Duration of the track
 * @param {boolean} datalist[].isLive whether the video is in livestream or not
 * @param {number} indexPage number for indexing queue items
 * @param {number} page for showing current page in embed
 * @param {CommandoMessage} msg message from user
 * @param {number} itemsPerPage number of items showed in embed
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

  // if page is the last page then exec this code
  if (page === Math.floor(listLength / itemsPerPage)) {
    for (let i = indexPage; i < listLength; i++) {
      // add => sign to current playing
      if (i !== msg.guild.indexQueue) {
        embed.fields.push({
          name: `[${i}] ${dataList[i].title}`,
          value: `${dataList[i].uploader} ${dataList[i].seconds ?
            '| ' + toTimestamp(dataList[i].seconds) : dataList[i].isLive ? '| • Live' : ''} | [YouTube](${dataList[i].link})`,
        })
      } else {
        embed.fields.push({
          name: `=> [${i}] ${dataList[i].title}`,
          value: `${dataList[i].uploader} ${dataList[i].seconds ?
            '| ' + toTimestamp(dataList[i].seconds) : dataList[i].isLive ? '| • Live' : ''} | [YouTube](${dataList[i].link})`,
        })
      }

    }
  } else {
    for (let i = indexPage; i < (itemsPerPage + indexPage); i++) {
      if (i !== msg.guild.indexQueue) {
        embed.fields.push({
          name: `[${i}] ${dataList[i].title}`,
          value: `${dataList[i].uploader} ${dataList[i].seconds ?
            '| ' + toTimestamp(dataList[i].seconds) : dataList[i].isLive ? '| • Live' : ''} | [YouTube](${dataList[i].link})`,
        })
      } else {
        embed.fields.push({
          name: `=> [${i}] ${dataList[i].title}`,
          value: `${dataList[i].uploader} ${dataList[i].seconds ?
            '| ' + toTimestamp(dataList[i].seconds) : dataList[i].isLive ? '| • Live' : ''} | [YouTube](${dataList[i].link})`,
        })
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
  )
  return embed;
}

module.exports = {
  setEmbedPlayCmd,
  setEmbedPlaying,
  setEmbedQueueCmd,
}