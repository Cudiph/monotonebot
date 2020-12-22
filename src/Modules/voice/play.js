const ytdl = require('discord-ytdl-core');
const yts = require('yt-search');
const { emoji } = require('../../library/helper/discord-item.js');
const { Command } = require('discord.js-commando');
const { oneLine } = require('common-tags');
const { player } = require('../../library/helper/player.js');
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
        usages: 2,
        duration: 15,
      },
      clientPermissions: ['CONNECT', 'SPEAK'],
      args: [
        {
          key: 'queryOrUrl',
          prompt: 'What video you want to search or put a videoId or the url?',
          type: 'string',
        }
      ]
    })
  }

  /** @param {CommandoMessage} message */
  async run(message, { queryOrUrl }) {
    // if not in voice channel
    if (!message.member.voice.channel) {
      // send message if author not connected to voice channel
      return message.channel.send("You're not connected to any voice channel");
    }

    if (message.member.voice.channel) {
      // check if author send a youtube link or video Id
      if (ytdl.validateURL(queryOrUrl) || ytdl.validateID(queryOrUrl)) {
        const vidId = ytdl.getVideoID(queryOrUrl);
        let data = await ytdl.getBasicInfo(vidId);
        let dataConstructor = {
          title: data.videoDetails.title,
          url: data.videoDetails.video_url,
          videoId: vidId,
          author: data.videoDetails.author.name ? data.videoDetails.author : { name: data.videoDetails.ownerChannelName },
          seconds: data.videoDetails.lengthSeconds,
          isLive: data.videoDetails.isLiveContent,
        }
        return player(dataConstructor, message);
      }

      message.channel.startTyping(); // start type indicator cuz it'll be a while
      let { videos } = await yts(queryOrUrl) // fetch yt vid using yt-search module
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
            const intEmoji = parseInt(reversed);
            if ((music + intEmoji) > videos.length) {
              // return if user choose more than the available song
              msg.delete();
              return message.reply(`Please choose the correct number.`);
            }
            let data = videos[music + intEmoji - 1];
            if (data.seconds === 0) {
              data.isLive = (await ytdl.getBasicInfo(data.videoId)).videoDetails.isLiveContent;
            }
            msg.delete();
            return player(data, message);
          }
        })

        for (let i = 0; i < emojiNeeded.length; i++) {
          if (msg) {
            await msg.react(emojiNeeded[i]);
          }
        }
      }).catch(err => {
        message.channel.stopTyping(true);
        return err;
      }); // cuz error is normal in this case

    }

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
}

