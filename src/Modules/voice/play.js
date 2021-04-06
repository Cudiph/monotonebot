const Util = require('../../util/Util.js');
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
  if (/^[a-zA-Z0-9-_]{11}$/.test(id)) {
    return id;
  }

  return false;
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

    msg.channel.startTyping(); // start type indicator cuz it'll be a while


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

    let page = 0; // for page
    let selectIndex = 0; // for choosing music index
    const itemsPerPage = 5; // set items showed per page

    const emojiNeeded = [Util.emoji[1], Util.emoji[2], Util.emoji[3], Util.emoji[4], Util.emoji[5], Util.emoji.leftA, Util.emoji.rightA, Util.emoji.x];

    const embedMsg = await msg.embed(msg.createEmbedPlay(res.tracks, selectIndex, page, itemsPerPage));
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
        if (page + 1 > Math.ceil(res.tracks.length / itemsPerPage)) {
          page = (Math.ceil(res.tracks.length / itemsPerPage)) - 1;
          selectIndex -= itemsPerPage;
          return;
        }
      }
      if (collected.emoji.name === '➡' || collected.emoji.name === '⬅') {
        const editedEmbed = embedMsg.createEmbedPlay(res.tracks, selectIndex, page, itemsPerPage);
        return embedMsg.edit({ embed: editedEmbed });
      }

      // user selecting a track
      if (emojiNeeded.slice(0, 5).includes(collected.emoji.name)) {
        const reversed = Object.keys(Util.emoji).find(key => Util.emoji[key] === collected.emoji.name);
        const intEmoji = parseInt(reversed);
        if ((selectIndex + intEmoji) > res.tracks.length) {
          // return if user choose more than the available song
          embedMsg.delete();
          return msg.reply(`Please choose the correct number.`);
        }
        const data = res.tracks[selectIndex + intEmoji - 1];
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
        embedMsg.delete();
        return msg.guild.pushToQueue(constructor, msg);

      }
    });

    for (let i = 0; i < emojiNeeded.length; i++) {
      if (embedMsg) await embedMsg.react(emojiNeeded[i]).catch(e => e);
    }

  }

};
