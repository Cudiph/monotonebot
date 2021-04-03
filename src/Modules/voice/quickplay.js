const ytdl = require('discord-ytdl-core');
const yts = require('yt-search');
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
  if (!id && link.match(/(embed|v|\.be|shorts)\//)) {
    const paths = link.split('/');
    id = paths[paths.length - 1].match(/([a-zA-Z0-9-_]{11})/);
  }

  if (!id) return false;

  id = id[1];
  if (!/^[a-zA-Z0-9-_]{11}$/.test(id)) {
    return false;
  }
  return id;
}


module.exports = class QuickPlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'quickplay',
      aliases: ['qp', 'qplay'],
      group: 'voice',
      memberName: 'quickplay',
      description: 'Instantly play related music without reacting',
      examples: ['quickplay Despacito 2', 'qp https://www.youtube.com/watch?v=D3dB3eflo1'],
      argsType: 'multiple',
      details: oneLine`
      Basically it's just a play command but the bot choose the top result and play
      or push it without you reacting to the message in case you know the first track will match
      or if you are to lazy to move your mouse.
      `,
      guildOnly: true,
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
            isLive: data.videoDetails.lengthSeconds == '0' ? true : false,
          };
          return msg.guild.pushToQueue(dataConstructor, msg);
        }
      }

      const { videos } = await yts(queryOrUrl); // fetch yt vid using yt-search module
      if (!videos.length) {
        msg.channel.stopTyping(true); // stop typing indicator
        return msg.say('No video found');
      }

      const data = videos[0];
      data.link = data.url;
      data.uploader = data.author.name;
      data.author = msg.author.tag;
      data.isLive = data.seconds === 0 ? true : false;
      return msg.guild.pushToQueue(data, msg);
    }

  }
};
