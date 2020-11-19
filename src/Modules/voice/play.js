const ytdl = require('ytdl-core-discord');
const yts = require('yt-search');
const { emoji } = require('../../library/helper/discord-item.js');
const { Command } = require('discord.js-commando');
const { oneLine } = require('common-tags');
const { player, play } = require('../../library/helper/player.js');
const { setEmbedPlayCmd } = require('../../library/helper/embed.js');

module.exports = class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'play',
      group: 'voice',
      memberName: 'play',
      description: 'Play audio from youtube',
      examples: ['play Despacito 2', 'play https://www.youtube.com/watch?v=D3dB3eflo1'],
      argsType: 'multiple',
      guildOnly: true,
      details: oneLine`
      Play audio from youtube. You can play with query or with a link in
      argument. If you want to resume your track please use resume instead
      because if you use play then it'll start over again when paused so use it to restart
      the player with no argument.
      `,
      throttling: {
        usages: 3,
        duration: 10,
      },
      clientPermissions: ['CONNECT', 'SPEAK'],
    })
  }

  async run(message, args) {
    // if not in voice channel
    if (!message.member.voice.channel) {
      // send message if author not connected to voice channel
      return message.channel.send("You're not connected to any voice channel");
    }

    if (message.member.voice.channel) {
      if (!args.length && !message.guild.queue) {
        return message.say('There is nothing to play');
      }
      if (!args.length && message.guild.me.voice.connection.dispatcher.paused) {
        return play(message);
      }
      const link = args[0].match(/https?:\/\/(www.)?youtube.com\/watch\?v=\w+/)

      // check if author send a youtube link
      if (link) {
        let data = await ytdl.getBasicInfo(args[0]);
        let dataConstructor = {
          title: data.videoDetails.title,
          url: data.url,
          author: data.videoDetails.author,
          seconds: data.videoDetails.lengthSeconds,
        }
        return player(dataConstructor, message);
      }

      message.channel.startTyping(); // start type indicator cuz it'll be long
      let { videos } = await yts(args.join(' ')) // fetch yt vid using yt-search module

      if (!videos.length) {
        message.channel.stopTyping(true); // stop typing indicator
        return message.say('No video found');
      }

      let page = 0; // for page
      let music = 0; // for choosing music index
      let itemsPerPage = 5; // set items showed per page

      let Embed = setEmbedPlayCmd(videos, music, page, message, itemsPerPage);
      let emojiNeeded = [emoji[1], emoji[2], emoji[3], emoji[4], emoji[5], emoji.leftA, emoji.rightA, emoji.x];

      message.channel.send({ embed: Embed }).then(async msg => {
        msg.channel.stopTyping(true); // stop typing indicator

        const filter = (reaction, user) => {
          return emojiNeeded.includes(reaction.emoji.name) && user.id === message.author.id;
        };
        const collector = msg.createReactionCollector(filter, { time: 60000, dispose: true });

        collector.on('collect', async collected => {
          if (collected.emoji.name === emoji.x) {
            msg.delete();
          } else if (collected.emoji.name === '⬅') {
            // decrement index for list
            page--;
            music -= itemsPerPage;
            if (page < 0) {
              page = 0;
              music = 0;
              return;
            }
          } else if (collected.emoji.name === '➡') {
            // increment index for list
            page++;
            music += itemsPerPage;
            // when page exceed the max of video length
            if (page + 1 > Math.ceil(videos.length / itemsPerPage)) {
              page = (Math.ceil(videos.length / itemsPerPage)) - 1;
              music -= itemsPerPage;
              return;
            }
          }
          if (collected.emoji.name === '➡' || collected.emoji.name === '⬅') {
            let embed2 = setEmbedPlayCmd(videos, music, page, message, itemsPerPage);
            return msg.edit({ embed: embed2 });
          }

          if (emojiNeeded.slice(0, 5).includes(collected.emoji.name)) {
            let reversed = Object.keys(emoji).find(key => emoji[key] === collected.emoji.name);
            let intEmoji = parseInt(reversed);
            let data = videos[music + intEmoji - 1];
            msg.delete();
            return player(data, message);
          }
        })

        for (let i = 0; i < emojiNeeded.length; i++) {
          if (msg) {
            await msg.react(emojiNeeded[i]);
          }
        }
      }).catch(err => message.channel.stopTyping(true)); // cuz error is normal in this case

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

