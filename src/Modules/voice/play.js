const ytdl = require('discord-ytdl-core');
const yts = require('yt-search');
const { emoji } = require('../../library/helper/discord-item.js');
const { Command } = require('discord.js-commando');
const { oneLine } = require('common-tags');
const { setEmbedPlayCmd } = require('../../library/helper/embed.js');

/**
 * Modified from ytdl.getURLVideoID to get Video ID from a link
 * @param {string} link
 * @return {string|boolean}
 */
function myGetVidID(link) {
  // valid if at least the link has watch?v=VIDEO_ID
  let id = link.match(/ch?.*v=([a-zA-Z0-9-_]{11})/);

  // valid if at least the link has xxx/VIDEO_ID
  if (!id && link.match(/(embed|v|\.be)\//)) {
    const paths = link.split('/');
    id = paths[paths.length - 1].match(/([a-zA-Z0-9-_]{11})/);
  }
  if (!id) {
    return false;
  }
  id = id[1];
  if (!/^[a-zA-Z0-9-_]{11}$/.test(id)) {
    return false;
  }
  return id;
}

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
      clientPermissions: ['CONNECT', 'SPEAK', 'ADD_REACTIONS'],
      args: [
        {
          key: 'queryOrUrl',
          prompt: 'What video you want to search or put a videoId or the url?',
          type: 'string',
        }
      ]
    });
  }

  /** @param {import('discord.js-commando').CommandoMessage} message */
  async run(message, { queryOrUrl }) {
    // if not in voice channel
    if (!message.member.voice.channel) {
      // send message if author not connected to voice channel
      return message.channel.send("You're not connected to any voice channel");
    }

    if (message.member.voice.channel) {
      // check if author send a youtube link or video Id
      if (myGetVidID(queryOrUrl) || ytdl.validateID(queryOrUrl)) {
        const vidId = myGetVidID(queryOrUrl);
        let data;
        try {
          data = await ytdl.getBasicInfo(vidId);
        } catch (e) {
          message.reply('No video with that URL or ID found.');
        }
        if (data) {
          const dataConstructor = {
            title: data.videoDetails.title,
            link: data.videoDetails.video_url,
            videoId: vidId,
            uploader: data.videoDetails.author.name || data.videoDetails.ownerChannelName,
            seconds: data.videoDetails.lengthSeconds,
            author: msg.author.tag,
            isLive: data.videoDetails.isLiveContent,
          };
          return message.guild.pushToQueue(dataConstructor, message);
        }

      }

      message.channel.startTyping(); // start type indicator cuz it'll be a while
      const { videos } = await yts(queryOrUrl); // fetch yt vid using yt-search module
      if (!videos.length) {
        message.channel.stopTyping(true); // stop typing indicator
        return message.say('No video found');
      }

      let page = 0; // for page
      let music = 0; // for choosing music index
      const itemsPerPage = 5; // set items showed per page

      const Embed = setEmbedPlayCmd(videos, music, page, message, itemsPerPage);
      const emojiNeeded = [emoji[1], emoji[2], emoji[3], emoji[4], emoji[5], emoji.leftA, emoji.rightA, emoji.x];

      const msg = await message.say({ embed: Embed });
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
          const embed2 = setEmbedPlayCmd(videos, music, page, message, itemsPerPage);
          return msg.edit({ embed: embed2 });
        }

        if (emojiNeeded.slice(0, 5).includes(collected.emoji.name)) {
          const reversed = Object.keys(emoji).find(key => emoji[key] === collected.emoji.name);
          const intEmoji = parseInt(reversed);
          if ((music + intEmoji) > videos.length) {
            // return if user choose more than the available song
            msg.delete();
            return message.reply(`Please choose the correct number.`);
          }
          const data = videos[music + intEmoji - 1];
          if (data.seconds === 0) {
            data.isLive = (await ytdl.getBasicInfo(data.videoId)).videoDetails.isLiveContent;
          }
          msg.delete();
          return message.guild.pushToQueue(data, message);
        }
      });

      for (let i = 0; i < emojiNeeded.length; i++) {
        if (msg) {
          await msg.react(emojiNeeded[i]).catch(e => e);
        }
      }

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
};

