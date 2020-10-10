const yts = require('yt-search');
const { Command } = require('discord.js-commando');
const { oneLine } = require('common-tags');
const { player } = require('../../library/helper/player.js');

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
      argsType: 'multiple',
      guildOnly: true,
      details: oneLine`
      Take a playlist from youtube and add all of the video to
      the queue. The cooldown is 30 seconds so please careful when
      using this command.
      `,
      throttling: {
        usages: 1,
        duration: 30,
      },
      clientPermissions: ['CONNECT', 'SPEAK'],
    })
  }

  async run(msg, args) {
    // if not in voice channel
    if (!msg.member.voice.channel) {
      // send msg if author not connected to voice channel
      return msg.channel.send("You're not connected to any voice channel");
    }
    if (!args.length) {
      return msg.say('Please provide an argument');
    }
    if (!msg.guild.me.voice.connection) {
      msg.member.voice.channel.join();
    }

    if (msg.member.voice.channel) {
      let link = args[0].match(/https?:\/\/(www.)?youtube.com\/watch\?(.*)?list=(\w+)(.*)?/);
      if (link) {
        try {
          let playlist = await yts({ listId: link[3] });
          // list of videos in the playlist
          const videos = playlist.videos
          videos.forEach(async video => {
            await player({
              title: video.title,
              url: `https://youtube.com/watch?v=${video.videoId}`,
              author: video.author,
              seconds: 0,
            }, msg, true);
          })
          return msg.say(`Added playlist ${playlist.title} by ${playlist.author.name}`);
        } catch (err) {
          logger.log('error', err)
          return msg.say('An error Occured');
        }
      } else {
        try {
          let playlist = await yts({ listId: args[0] });
          const videos = playlist.videos
          videos.forEach(async video => {
            await player({
              title: video.title,
              url: `https://youtube.com/watch?v=${video.videoId}`,
              author: video.author,
              seconds: 0,
            }, msg, true);
          });
          return msg.say(`Added playlist ${playlist.title} by ${playlist.author.name}`);
        } catch (err) {
          logger.log('error', err)
          return msg.say('An error Occured');
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

