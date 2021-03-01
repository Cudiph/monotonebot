const ytdl = require('discord-ytdl-core');
const yts = require('yt-search');
const Util = require('../../util/Util.js');
const Command = require('../../structures/Command.js');
const { oneLine } = require('common-tags');

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

  /** @param {import('discord.js-commando').CommandoMessage} msg */
  async run(msg, { queryOrUrl }) {
    // if not in voice channel
    if (!msg.member.voice.channel) {
      // send message if author not connected to voice channel
      return msg.channel.send("You're not connected to any voice channel");
    }

    if (msg.member.voice.channel) {
      // check if author send a youtube link or video Id
      if (myGetVidID(queryOrUrl) || ytdl.validateID(queryOrUrl)) {
        const vidId = myGetVidID(queryOrUrl);
        let data;
        try {
          data = await ytdl.getBasicInfo(vidId);
        } catch (e) {
          msg.reply('No video with that URL or ID found.');
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
          return msg.guild.pushToQueue(dataConstructor, msg);
        }

      }

      msg.channel.startTyping(); // start type indicator cuz it'll be a while
      const { videos } = await yts(queryOrUrl); // fetch yt vid using yt-search module
      if (!videos.length) {
        msg.channel.stopTyping(true); // stop typing indicator
        return msg.say('No video found');
      }

      let page = 0; // for page
      let selectIndex = 0; // for choosing music index
      const itemsPerPage = 5; // set items showed per page

      const emojiNeeded = [Util.emoji[1], Util.emoji[2], Util.emoji[3], Util.emoji[4], Util.emoji[5], Util.emoji.leftA, Util.emoji.rightA, Util.emoji.x];

      const embedMsg = await msg.embed(msg.createEmbedPlay(videos, selectIndex, page, itemsPerPage));
      msg.channel.stopTyping(true); // stop typing indicator

      const filter = (reaction, user) => {
        return emojiNeeded.includes(reaction.emoji.name) && user.id === msg.author.id;
      };
      const collector = embedMsg.createReactionCollector(filter, { time: 60000, dispose: true });

      collector.on('collect', async collected => {
        if (collected.emoji.name === Util.emoji.x) {
          embedMsg.delete();
        } else if (collected.emoji.name === '⬅') {
          // decrement index for list
          page--;
          selectIndex -= itemsPerPage;
          if (page < 0) {
            page = 0;
            selectIndex = 0;
            return;
          }
        } else if (collected.emoji.name === '➡') {
          // increment index for list
          page++;
          selectIndex += itemsPerPage;
          // when page exceed the max of video length
          if (page + 1 > Math.ceil(videos.length / itemsPerPage)) {
            page = (Math.ceil(videos.length / itemsPerPage)) - 1;
            selectIndex -= itemsPerPage;
            return;
          }
        }
        if (collected.emoji.name === '➡' || collected.emoji.name === '⬅') {
          const editedEmbed = embedMsg.createEmbedPlay(videos, selectIndex, page, itemsPerPage);
          return embedMsg.edit({ embed: editedEmbed });
        }

        // user selecting a track
        if (emojiNeeded.slice(0, 5).includes(collected.emoji.name)) {
          const reversed = Object.keys(Util.emoji).find(key => Util.emoji[key] === collected.emoji.name);
          const intEmoji = parseInt(reversed);
          if ((selectIndex + intEmoji) > videos.length) {
            // return if user choose more than the available song
            embedMsg.delete();
            return msg.reply(`Please choose the correct number.`);
          }
          const data = videos[selectIndex + intEmoji - 1];
          data.link = data.url;
          data.uploader = data.author.name;
          data.author = msg.author.tag;
          data.isLive = data.seconds === 0 ? true : false;
          embedMsg.delete();
          return msg.guild.pushToQueue(data, msg);
        }
      });

      for (let i = 0; i < emojiNeeded.length; i++) {
        if (embedMsg) await embedMsg.react(emojiNeeded[i]).catch(e => e);
      }

    }

  }

};

