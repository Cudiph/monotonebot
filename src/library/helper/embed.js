const { toTimestamp, randomHex } = require('./discord-item.js');


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
      text: `🔊 ${msg.guild.volume * 100} | ${toTimestamp(music.seconds)} | ${music.author}`
    }
  }
  return embed;
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
          value: `${dataList[indexPage + i].uploader} ${dataList[indexPage + i].seconds
            ? '| ' + toTimestamp(dataList[indexPage + i].seconds) : ''}`,
        })
      } else {
        embed.fields.push({
          name: `=> [${indexPage + i}] ${dataList[indexPage + i].title}`,
          value: `${dataList[indexPage + i].uploader} ${dataList[indexPage + i].seconds
            ? '| ' + toTimestamp(dataList[indexPage + i].seconds) : ''}`,
        })
      }

    }
  } else {
    for (let i = 0; i < itemsPerPage; i++) {
      if ((indexPage + i) !== msg.guild.indexQueue) {
        embed.fields.push({
          name: `[${indexPage + i}] ${dataList[indexPage + i].title}`,
          value: `${dataList[indexPage + i].uploader} ${dataList[indexPage + i].seconds
            ? '| ' + toTimestamp(dataList[indexPage + i].seconds) : ''}`,
        })
      } else {
        embed.fields.push({
          name: `=> [${indexPage + i}] ${dataList[indexPage + i].title}`,
          value: `${dataList[indexPage + i].uploader} ${dataList[indexPage + i].seconds
            ? '| ' + toTimestamp(dataList[indexPage + i].seconds) : ''}`,
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