const { Command } = require('discord.js-commando');
const ytdl = require('discord-ytdl-core');
const { randomHex } = require('../../library/helper/discord-item');

module.exports = class NowPlayingCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'nowplaying',
      group: 'voice',
      aliases: ['np'],
      memberName: 'nowplaying',
      description: 'Show full information of the current track and the voice state',
      examples: ['nowplaying', 'np'],
      guildOnly: true,
      throttling: {
        usages: 3,
        duration: 25,
      },
    });
  }

  /** @param {import('discord.js-commando').CommandoMessage} msg */
  async run(msg) {
    const queue = msg.guild.queue;
    const indexQ = msg.guild.indexQueue;
    if (!queue || !queue.length) {
      return msg.say(`There is no queue.`);
    } else if (indexQ >= queue.length) {
      return msg.reply(`Currently not playing any track`);
    }

    const trackInfo = await ytdl.getInfo(queue[indexQ].link);

    const embed = {
      color: parseInt(randomHex(), 16),
      title: trackInfo.videoDetails.title,
      url: trackInfo.videoDetails.video_url,
      author: {
        name: `${trackInfo.videoDetails.author.name} ${trackInfo.videoDetails.author.verified ? '✔' : ''}`,
        icon_url: trackInfo.videoDetails.author.thumbnails[0].url,
        url: trackInfo.videoDetails.author.channel_url,
      },
      description: trackInfo.videoDetails.description.split('\n')[0] + '...',
      thumbnail: { url: trackInfo.videoDetails.thumbnails[0].url },
      fields: [
        {
          name: `View Count`,
          value: trackInfo.videoDetails.viewCount,
          inline: true,
        },
        {
          name: `Likes 👍`,
          value: trackInfo.videoDetails.likes,
          inline: true,
        },
        {
          name: `Dislikes 👎`,
          value: trackInfo.videoDetails.dislikes,
          inline: true,
        },
        {
          name: `Paused?`,
          value: msg.guild.me.voice.connection.dispatcher.paused ? '✅' : '❌',
          inline: true,
        },
        {
          name: `Loop?`,
          value: msg.guild.loop ? '✅' : '❌',
          inline: true,
        },
        {
          name: `LoopQueue?`,
          value: msg.guild.loopQueue ? '✅' : '❌',
          inline: true,
        },
        {
          name: `Volume`,
          value: msg.guild.me.voice.connection.dispatcher.volume * 100,
          inline: true,
        },
        {
          name: `Autoplay?`,
          value: msg.guild.autoplay ? '✅' : '❌',
          inline: true,
        },
        {
          name: `Bitrate`,
          value: `${msg.guild.me.voice.connection.channel.bitrate / 1000} Kbps`,
          inline: true,
        }
      ],
      footer: {
        text: `Published at ${trackInfo.videoDetails.publishDate} • Uploaded at ${trackInfo.videoDetails.uploadDate}`
      }
    };

    let counter = 0;
    const related = [];
    for (const track of trackInfo.related_videos) {
      related.push(`• ${track.title} by ${track.author.name}`);
      if (counter > 3) break;
      counter++;
    }

    embed.fields.splice(3, 0, {
      name: `Related Videos`,
      value: related.join('\n')
    });

    return msg.say({ embed: embed });
  }

  async onBlock(msg, reason, data) {
    super.onBlock(msg, reason, data)
      .then(blockMsg => blockMsg.delete({ timeout: 10000 }))
      .catch(e => e); // do nothing
  }

  onError(err, message, args, fromPattern, result) {
    super.onError(err, message, args, fromPattern, result)
      .then(msgParent => msgParent.delete({ timeout: 10000 }))
      .catch(e => e); // do nothing
  }
};
