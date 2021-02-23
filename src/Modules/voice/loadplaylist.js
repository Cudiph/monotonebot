const { oneLine } = require('common-tags');
const Command = require('../../structures/Command.js');
const { userDataSchema } = require('../../library/Database/schema.js');

module.exports = class LoadPlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'loadplaylist',
      group: 'voice',
      aliases: ['loadpl', 'loadplaylist'],
      examples: ['loadpl 1', 'loadplaylist 3'],
      memberName: 'loadplaylist',
      description: 'Load playlist from database',
      details: oneLine`
        Basic regular expression such as asterisk or caret are allowed.
        If client received 2 or more playlists, it'll take a random playlists
        and then pushed to the guild queue.
      `,
      guildOnly: true,
      throttling: {
        usages: 3,
        duration: 120,
      },
      args: [
        {
          key: 'playlistArg',
          label: 'PlaylistName|PlaylistId',
          prompt: 'What\'s the name or id of your playlist?',
          type: 'integer|string',
        }
      ]
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg, { playlistArg }) {
    if (!msg.member.voice.channel) {
      return msg.reply("You're not connected to any voice channel");
    }
    if (msg.guild.queue && msg.guild.queue.length > 150) {
      return msg.say(oneLine`
        You reached maximum number of track.
        Please clear the queue first with **\`${msg.guild.commandPrefix}stop 1\`**.
      `);
    }

    if (typeof playlistArg === 'number') {
      try {
        const data = await userDataSchema.findOne({ userId: msg.author.id });
        if (!data || !data.userPlaylists.length) {
          return msg.say('You don\'t have any playlist');
        } else if (playlistArg < 0 && playlistArg > data.userPlaylists.length) {
          return msg.say(`Your current playlist range is from 0-${data.userPlaylists.length - 1}`);
        }
        const playlist = data.userPlaylists[playlistArg];
        if (!msg.guild.queue) {
          msg.guild.queue = playlist.videoList;
          msg.guild.indexQueue = 0;
          msg.guild.play(msg);
        } else {
          const oldLength = msg.guild.queue.length;
          msg.guild.queue.push(...playlist.videoList);
          if (msg.guild.queueTemp) msg.guild.queueTemp.push(...playlist.videoList);
          if (msg.guild.indexQueue >= oldLength) msg.guild.play(msg);
        }
        return msg.say(`Added playlist **${playlist.name}**.`);
      } catch (err) {
        logger.log('error', err);
        return msg.reply(`Can't load the playlist`);
      }
    } else {
      const secureStr = playlistArg.replace(/(\\|\(|\{|\$)/gi, '');
      try {
        const data = await userDataSchema.aggregate([
          { $match: { userId: msg.author.id } },
          {
            $project: {
              userPlaylists: {
                $filter: {
                  input: "$userPlaylists",
                  as: "playlist",
                  cond: { $regexFind: { input: "$$playlist.name", regex: new RegExp(`${secureStr}`) } }
                }
              }
            }
          },
          { $unwind: "$userPlaylists" }
        ]);
        if (!data.length) {
          return msg.reply(`Can't find the specified playlist`);
        }
        const playlist = data[Math.floor(Math.random() * data.length)].userPlaylists;
        if (!msg.guild.queue) {
          msg.guild.queue = playlist.videoList;
          msg.guild.indexQueue = 0;
          msg.guild.play(msg);
        } else {
          const oldLength = msg.guild.queue.length;
          msg.guild.queue.push(...playlist.videoList);
          if (msg.guild.queueTemp) msg.guild.queueTemp.push(...playlist.videoList);
          if (msg.guild.indexQueue >= oldLength) msg.guild.play(msg);
        }
        return msg.say(`Added playlist **${playlist.name}**.`);
      } catch (err) {
        logger.log('error', err);
        if (err.message.includes('regular expression')) {
          return msg.reply(`Please give a valid regular expression`);
        } else {
          return msg.reply(`Can't load the playlist`);
        }
      }
    }

  }

};

