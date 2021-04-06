const ytdl = require('ytdl-core');
const Command = require('../../structures/Command.js');
const { oneLine } = require('common-tags');

/**
 * return link or ID to resolve for lavalink return false if can't be resolved
 * @param {string} link
 * @return {string|boolean}
 */
function resolve(link) {
  const scLink = link.match(/soundcloud\.com\/([A-Za-z0-9_-]+\/[A-Za-z0-9_-]+)/);
  if (scLink) {
    return `https://soundcloud.com/${scLink[1]}`;
  }

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
          prompt: 'What video you want to search or put a videoID or the url?',
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

    /** @type {import('shoukaku').ShoukakuSocket} */
    const node = this.client.lavaku.getNode();

    // check if author send a youtube link or video Id
    const isOnlyID = ytdl.validateID(queryOrUrl);
    if (resolve(queryOrUrl) || isOnlyID) {
      const vidID = isOnlyID ? queryOrUrl : resolve(queryOrUrl);
      /** @type {import('shoukaku').ShoukakuTrackList} */

      const data = await node.rest.resolve(vidID).catch(e => e);

      if (data) {
        const dataConstructor = {
          title: data.tracks[0].info.title,
          link: data.tracks[0].info.uri,
          videoID: data.tracks[0].info.uri.includes('soundcloud.com') ? '' : data.tracks[0].info.identifier,
          uploader: data.tracks[0].info.author,
          seconds: data.tracks[0].info.length / 1000,
          author: msg.author.tag,
          isLive: data.tracks[0].info.isStream,
          track: data.tracks[0].track,
        };
        return msg.guild.pushToQueue(dataConstructor, msg);
      }

    }


    /** @type {import('shoukaku').ShoukakuTrackList} */
    let res;
    try {
      res = await node.rest.resolve(queryOrUrl, 'youtube');
      if (!res?.tracks.length) {
        msg.channel.stopTyping(true);
        return msg.say('No track found.');
      }
    } catch (e) {
      logger.error(e.stack);
      msg.channel.stopTyping(true);
      return msg.say('Something went wrong while searching the track.');
    }

    const data = res.tracks[0];
    const constructor = {
      title: data.info.title,
      link: data.info.uri,
      videoID: resolve(data.info.uri),
      uploader: data.info.author,
      seconds: data.info.length / 1000,
      author: msg.author.tag,
      isLive: data.info.isStream,
      track: data.track,
    };
    msg.guild.pushToQueue(constructor, msg);

  }
};
