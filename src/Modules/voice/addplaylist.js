const ytpl = require('ytpl');
const { Command } = require('discord.js-commando');
const { oneLine, stripIndents } = require('common-tags');
const { player } = require('../../library/helper/player.js');
const { toSeconds } = require('../../library/helper/discord-item.js');

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
      the queue. The cooldown is 600 seconds so please careful when
      using this command.
      `,
      throttling: {
        usages: 2,
        duration: 600,
      },
      clientPermissions: ['CONNECT', 'SPEAK'],
      format: '["Video Id"/"Full url"]',
      args: [
        {
          key: 'listId',
          prompt: 'What playlist you want to add? (list id or full url, broken url can be tolerated)',
          type: 'string',
        }
      ]
    })
  }

  async run(msg, { listId }) {
    // if not in voice channel
    if (!msg.member.voice.channel) {
      // send msg if author not connected to voice channel
      return msg.channel.send("You're not connected to any voice channel");
    }

    if (msg.member.voice.channel) {
      let link = listId.match(/(?:.*)?list=([\w+|-]+)(?:.*)?/);
      if (link) {
        try {
          let playlist = await ytpl(link[1]);
          // list of videos in the playlist
          const videos = playlist.items
          videos.forEach(async video => {
            await player({
              title: video.title,
              url: `https://youtube.com/watch?v=${video.id}`,
              videoId: video.id,
              author: video.author,
              seconds: toSeconds(video.duration),
            }, msg, true);
          })
          return msg.say(`Added playlist **${playlist.title}**. `);
        } catch (err) {
          logger.log('error', err)
          return msg.say(stripIndents`An error Occured.
            Maybe it's because the playlist is private or the playlist is from a mix or the playlist doesn't exist at all
            Error : \`${err}\`
          `);
        }
      } else {
        try {
          let playlist = await ytpl(listId);
          const videos = playlist.items
          videos.forEach(async video => {
            await player({
              title: video.title,
              url: `https://youtube.com/watch?v=${video.id}`,
              videoId: video.id,
              author: video.author,
              seconds: toSeconds(video.duration),
            }, msg, true);
          });
          return msg.say(`Added playlist **${playlist.title}**. `);
        } catch (err) {
          logger.log('error', err)
          return msg.say(stripIndents`An error Occured.
            Maybe it's because the playlist is private or the playlist is from a mix or the playlist doesn't exist at all
            Error : \`${err}\`
          `);
        }
      }
    }

  }

  async onBlock(msg, reason, data) {
    let parent = await super.onBlock(msg, reason, data);
    parent.delete({ timeout: 9000 })
  }

  onError(err, message, args, fromPattern, result) {
    super.onError(err, message, args, fromPattern, result)
      .then(msgParent => msgParent.delete({ timeout: 9000 }));
  }
}

