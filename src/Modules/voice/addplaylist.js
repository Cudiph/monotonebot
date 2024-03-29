const Command = require('../../structures/Command.js');
const { oneLine } = require('common-tags');

/**
 * @param {string} link link to validate
 * @returns {string}
 */
function resolve(link) {
  const listID = link.match(/.*list=([a-zA-Z0-9-_]+).*?/);
  const vidID = link.match(/v=([a-zA-Z0-9-_]{11})/);
  const SClink = link.match(/[A-Za-z0-9_-]+\/sets\/[A-Za-z0-9_-]+/);

  if (SClink) {
    return `https://soundcloud.com/${SClink[0]}`; // scpl
  } else if (listID && vidID) {
    // to get mix playlist lavalink need listiD and vidID
    return `https://www.youtube.com/watch?v=${vidID[1]}&list=${listID[1]}`;
  } else if (listID) {
    return listID[1]; // take only list ID
  } else {
    return link;
  }
}

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
          key: 'urlOrlistID',
          prompt: 'What playlist do you want me to add?',
          type: 'string',
        }
      ]
    });
  }

  /** @param {import('discord.js-commando').CommandoMessage} msg */
  async run(msg, { urlOrlistID }) {
    // if not in voice channel
    if (!msg.member.voice.channel) {
      // send msg if author not connected to voice channel
      return msg.reply("You're not connected to any voice channel");
    }

    if (msg.guild.queue?.length > msg.guild.queueLimit) {
      return msg.say(oneLine`
        You reached maximum number of track.
        Please clear the queue first with **\`${msg.guild.commandPrefix}stop 1\`**.
      `);
    }

    /** @type {import('shoukaku').ShoukakuSocket} */
    const node = this.client.lavaku.getNode();

    /** @type {import('shoukaku').ShoukakuTrackList} */
    let data;
    try {
      data = await node.rest.resolve(resolve(urlOrlistID));
      if (data?.type !== 'PLAYLIST') return msg.reply(`playlist not found.`);
    } catch (e) {
      logger.error(e.stack);
      msg.reply('Something went wrong when fetching the playlist');
      return;
    }

    for (const track of data.tracks) {
      msg.guild.pushToQueue({
        title: track.info.title,
        link: track.info.uri,
        uploader: track.info.author,
        seconds: track.info.length / 1000,
        author: msg.author.tag,
        videoID: track.info.identifier,
        isLive: track.info.isStream,
        track: track.track,
      }, msg, true);
    }
    return msg.say(`Added playlist **${data.playlistName}**.`);
  }

};
