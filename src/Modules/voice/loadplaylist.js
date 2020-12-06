const { oneLine } = require('common-tags');
const { Command } = require('discord.js-commando');
const { userDataSchema } = require('../../library/Database/schema.js');
const { play } = require('../../library/helper/player.js');

module.exports = class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'loadplaylist',
      group: 'voice',
      aliases: ['loadpl', 'loadplaylist'],
      examples: ['loadpl 1', 'loadplaylist 3'],
      memberName: 'loadplaylist',
      description: 'Load playlist from database',
      guildOnly: true,
      throttling: {
        usages: 3,
        duration: 300,
      },
      args: [
        {
          key: 'playlistId',
          prompt: 'What\'s the id of your playlist?',
          type: 'integer',
        }
      ]
    })
  }

  async run(msg, { playlistId }) {
    if (!msg.member.voice.channel) {
      return msg.channel.send("You're not connected to any voice channel");
    }
    if (msg.guild.queue && msg.guild.queue.length > 150) {
      return msg.say(oneLine`
        You reached maximum number of track.
        Please clear the queue first with **\`${msg.guild.commandPrefix}stop 1\`**.
      `);
    }

    try {
      const data = await userDataSchema.findOne({ id: msg.author.id });
      if (!data || !data.userPlaylists.length) {
        return msg.say('You don\'t have any playlist')
      } else if (playlistId < 0 && playlistId > data.userPlaylists.length) {
        return msg.say(`Your current playlist is from 0-${data.userPlaylists.length - 1}`)
      }
      const playlist = data.userPlaylists[playlistId]
      if (!msg.guild.queue) {
        msg.guild.queue = playlist.videoList;
        msg.guild.indexQueue = 0;
        return play(msg);
      }
      const oldLength = msg.guild.queue.length;
      msg.guild.queue.push(...playlist.videoList);
      msg.say(`Added playlist **${playlist.name}**.`);
      if (msg.guild.indexQueue >= oldLength) {
        return play(msg);
      }
    } catch (err) {
      logger.log('error', err);
      return msg.channel.send(`Can't load the playlist`);
    }

  }

}

