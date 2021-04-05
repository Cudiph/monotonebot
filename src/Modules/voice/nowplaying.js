const Command = require('../../structures/Command.js');
const ytdl = require('discord-ytdl-core');
const Util = require('../../util/Util');

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
    const player = this.client.lavaku.getPlayer(msg.guild.id);
    const queue = msg.guild.queue;
    const indexQ = msg.guild.indexQueue < 0 ? 0 : msg.guild.indexQueue;
    if (!queue || !queue.length) {
      return msg.say(`There is no queue.`);
    } else if (indexQ >= queue.length || !player?.track) {
      return msg.reply(`Currently not playing any track`);
    }

    const trackInfo = await ytdl.getInfo(queue[indexQ].link || queue[indexQ].videoId);

    const embed = {
      color: parseInt(Util.randomHex(), 16),
      title: `${trackInfo.videoDetails.title} [#${indexQ}]`,
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
          value: player.paused ? '✅' : '❌',
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
          value: player.filters.volume * 100,
          inline: true,
        },
        {
          name: `Autoplay?`,
          value: msg.guild.autoplay ? '✅' : '❌',
          inline: true,
        },
        {
          name: `Channel Bitrate`,
          value: `${msg.guild.channels.cache.get(player.voiceConnection.voiceChannelID).bitrate / 1000} Kbps`,
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
      related.push(`• **${track.title}** by *${track.author.name}*`);
      if (counter > 3) break;
      counter++;
    }

    embed.fields.splice(3, 0, {
      name: `Related Videos`,
      value: related.join('\n')
    });

    return msg.say({ embed: embed });
  }

};
