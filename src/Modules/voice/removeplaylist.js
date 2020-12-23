const { oneLine } = require('common-tags');
const { Command } = require('discord.js-commando');
const { userDataSchema } = require('../../library/Database/schema.js');

module.exports = class RemovePlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'removeplaylist',
      group: 'voice',
      memberName: 'removeplaylist',
      aliases: ['rmpl', 'removepl'],
      examples: ['rmpl "My best playlist"', 'removepl 2', 'removeplaylist pop music'],
      description: 'Delete playlist from database',
      details: oneLine`
        If there any playlist with the same name, all of those playlist will be deleted.
        Regex for this command is not allowed and the argument is case sensitive.
      `,
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 15,
      },
      args: [
        {
          key: 'playlistArg',
          prompt: 'What is the name or id of your playlist?',
          type: 'integer|string',
        },
      ]
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg, { playlistArg }) {
    const data = await userDataSchema.findOne({ userId: msg.author.id });

    if (!data || !data.userPlaylists.length) {
      return msg.say('You don\'t have any playlist');
    } else if (playlistArg < 0 && playlistArg >= data.userPlaylists.length) {
      return msg.say(`Your current playlist is from 0-${data.userPlaylists.length - 1}`);
    }

    if (typeof playlistArg === 'number') {
      try {
        // change the name because mongodb can remove based on index
        const template = `userPlaylists.${playlistArg}.name`;
        const update = {
          $set: { [template]: 'deletethis' }
        };
        const before = await userDataSchema.findOneAndUpdate({ userId: msg.author.id, }, update);
        // finally delete the renamed playlist
        await userDataSchema.findOneAndUpdate({ userId: msg.author.id, }, {
          $pull: {
            userPlaylists: {
              name: 'deletethis'
            }
          }
        });
        msg.say(`Deleted playlist **${before.userPlaylists[playlistArg].name}**`);
      } catch (err) {
        logger.log('error', err.stack);
        return msg.reply(`Can't remove the playlist`);
      }
    } else {
      const data2 = await userDataSchema.findOneAndUpdate({ userId: msg.author.id }, {
        $pull: { userPlaylists: { name: playlistArg } }
      });
      let counter = 0;
      for (let i = 0; i < data2.userPlaylists.length; i++) {
        if (data2.userPlaylists[i].name === playlistArg) {
          counter++;
        }
      }
      if (counter) {
        if (counter > 1) {
          return msg.reply(`Removed ${counter} playlists named **${playlistArg}**`);
        } else {
          return msg.reply(`**${playlistArg}** Playlist was successfully removed`);
        }
      } else {
        return msg.reply(`No playlist named **${playlistArg}**`);
      }
    }

  }
};
