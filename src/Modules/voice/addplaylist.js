const ytpl = require('ytpl');
const Command = require('../../structures/Command.js');
const { oneLine, stripIndents } = require('common-tags');
const Util = require('../../util/Util.js');

module.exports = class AddPlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'addplaylist',
      group: 'voice',
      memberName: 'addplaylist',
      aliases: ['addpl'],
      description: 'Take a list from youtube an push all vids to the queue',
      examples: ['addplaylist PLtByeX9ycvplxbyVX7fiUA4f_OxiyNOxk',
        'addplaylist https://www.youtube.com/watch?v=q6EoRBvdVPQ&list=PLFsQleAWXsj_4yDeebiIADdH5FMayBiJo'],
      guildOnly: true,
      details: oneLine`
      Take a playlist from youtube and add all of the video to
      the queue. If the playlist contain more than 100 videos, only
      the first 100 that will be pushed to the queue.
      `,
      throttling: {
        usages: 1,
        duration: 60,
      },
      clientPermissions: ['CONNECT', 'SPEAK'],
      format: '<VideoId/FullUrl>',
      args: [
        {
          key: 'listId',
          prompt: 'What playlist you want to add? (broken url can be tolerated, as long as the argument has playlist Id)',
          type: 'string',
        }
      ]
    });
  }

  /** @param {import('discord.js-commando').CommandoMessage} msg */
  async run(msg, { listId }) {
    // if not in voice channel
    if (!msg.member.voice.channel) {
      // send msg if author not connected to voice channel
      return msg.reply("You're not connected to any voice channel");
    }

    if (msg.member.voice.channel) {
      const link = listId.match(/(?:.*)?list=([\w+|-]+)(?:.*)?/);
      if (link) {
        try {
          const playlist = await ytpl(link[1]);
          // list of videos in the playlist
          const videos = playlist.items;
          videos.forEach(async video => {
            if (msg.guild.queue?.length >= 150) {
              return;
            }
            msg.guild.pushToQueue({
              title: video.title,
              link: `https://youtube.com/watch?v=${video.id}`,
              videoID: video.id,
              uploader: video.author.name,
              seconds: Util.toSeconds(video.duration),
              author: msg.author.tag,
              isLive: Util.toSeconds(video.duration) == 0 ? true : false,
            }, msg, true);
          });
          if (msg.guild.queue?.length >= 150) {
            return msg.say(oneLine`
              You reached maximum number of track.
              Please clear the queue first with **\`${msg.guild.commandPrefix}stop 1\`**.
            `);
          }
          return msg.say(`Added playlist **${playlist.title}**. `);
        } catch (err) {
          logger.error(err.stack);
          return msg.say(stripIndents`An error Occured.
            Maybe it's because the playlist is private or the playlist is from a mix or the playlist doesn't exist at all
            Error : \`${err}\`
          `);
        }
      } else {
        try {
          const playlist = await ytpl(listId);
          const videos = playlist.items;
          videos.forEach(video => {
            if (msg.guild.queue?.length >= 150) {
              return;
            }
            msg.guild.pushToQueue({
              title: video.title,
              link: `https://youtube.com/watch?v=${video.id}`,
              videoID: video.id,
              uploader: video.author,
              seconds: Util.toSeconds(video.duration),
              author: msg.author.tag,
              isLive: Util.toSeconds(video.duration) == 0 ? true : false,
            }, msg, true);
          });
          if (msg.guild.queue?.length >= 150) {
            return msg.say(oneLine`
              You reached maximum number of track.
              Please clear the queue first with **\`${msg.guild.commandPrefix}stop 1\`**.
            `);
          }
          return msg.say(`Added playlist **${playlist.title}**. `);
        } catch (err) {
          logger.error(err.stack);
          return msg.say(stripIndents`An error Occured.
            Maybe it's because the playlist is private or the playlist is from a mix or the playlist doesn't exist at all
            Error : \`${err}\`
          `);
        }
      }
    }

  }

};

