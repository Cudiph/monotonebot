const Command = require('../../structures/Command.js');
const ytdl = require('ytdl-core');
const scdl = require('soundcloud-downloader').default;
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

    if (queue[indexQ].link.includes('youtube.com/')) {
      const trackInfo = await ytdl.getInfo(queue[indexQ].link || queue[indexQ].videoID);

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

      return msg.embed(embed);
    }

    const trackInfo = await scdl.getInfo(queue[indexQ].link);

    const embed = {
      color: parseInt(Util.randomHex(), 16),
      title: `${trackInfo.title} [#${indexQ}]`,
      url: trackInfo.permalink_url,
      author: {
        name: `${trackInfo.user.username} ${trackInfo.user.verified ? '✔' : ''}`,
        icon_url: trackInfo.user.avatar_url,
        url: trackInfo.user.permalink_url,
      },
      description: trackInfo.description.split('\n').slice(0, 10).join('\n') + '...\n',
      thumbnail: { url: trackInfo.artwork_url },
      fields: [
        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: `🎧 Listen Count`,
          value: trackInfo.playback_count,
          inline: true,
        },
        {
          name: `♥ Likes`,
          value: trackInfo.likes_count,
          inline: true,
        },
        {
          name: `🔁 Repost`,
          value: trackInfo.reposts_count,
          inline: true,
        },
        {
          name: `Genre`,
          value: trackInfo.genre,
          inline: true,
        },
        {
          name: `Tags`,
          value: trackInfo.tag_list,
          inline: true,
        },
        {
          name: `Stream/Buy`,
          value: trackInfo.purchase_url ?? '-',
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
        text: `Published at ${trackInfo.created_at.substr(0, 10)}`
      }
    };

    msg.embed(embed);

  }

};
