const { Command } = require('discord.js-commando');
const { userDataSchema } = require('../../library/Database/schema.js');

module.exports = class RemovePlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'removeplaylist',
      group: 'voice',
      memberName: 'removeplaylist',
      aliases: ['rmpl', 'removepl'],
      examples: ['rmpl 4', 'removepl 2', 'removeplaylist 0'],
      description: 'Delete playlist from database',
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 15,
      },
      args: [
        {
          key: 'playlistId',
          prompt: 'What is the id of your playlist?',
          type: 'string',
        },
      ]
    })
  }

  async run(msg, { playlistId }) {
    const data = await userDataSchema.findOne({ userId: msg.author.id });

    if (!data || !data.userPlaylists.length) {
      return msg.say('You don\'t have any playlist')
    } else if (playlistId < 0 && playlistId >= data.userPlaylists.length) {
      return msg.say(`Your current playlist is from 0-${data.userPlaylists.length - 1}`)
    }

    try {
      const template = `userPlaylists.${playlistId}.name`
      const update = {
        $set: { [template]: 'deletethis' }
      }
      let before = await userDataSchema.findOneAndUpdate({ userId: msg.author.id, }, update)
      await userDataSchema.findOneAndUpdate({ userId: msg.author.id, }, {
        $pull: {
          userPlaylists: {
            name: 'deletethis'
          }
        }
      })
      msg.say(`Deleted playlist **${before.userPlaylists[playlistId].name}**`)
    } catch (err) {
      logger.log('error', err.stack);
      return msg.channel.send(`Can't remove the playlist`);
    }

  }

}

