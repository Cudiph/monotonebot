const { Command } = require('discord.js-commando');
const { oneLine } = require('common-tags');
const { userDataSchema } = require('../../library/Database/schema.js');

module.exports = class SaveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'save',
      group: 'voice',
      memberName: 'save',
      description: 'Save queue to database',
      examples: ['save "my best playlist" this playlist is my favorite and i will hear it all the time',
        'save myPlaylist'
      ],
      guildOnly: true,
      details: oneLine`
      Save current queue to database so you can load again later
      with \`loadpl\` command 
      `,
      throttling: {
        usages: 2,
        duration: 86400,
      },
      args: [
        {
          key: 'playlistName',
          prompt: 'What is the name of your playlist?',
          type: 'string',
        },
        {
          key: 'description',
          prompt: 'What do you think about this playlist?',
          type: 'string',
          default: '-',
        }
      ]
    })
  }

  async run(msg, { playlistName, description }) {
    if (!msg.guild.queue || msg.guild.queue && !msg.guild.queue.length) {
      return msg.say('The queue is empty');
    }

    try {
      const condition = {
        id: msg.author.id,
      }
      const update = {
        $push: {
          userPlaylists: {
            name: playlistName,
            description: description,
            videoList: msg.guild.queue,
            timestamps: new Date(),
          }
        }
      }
      await userDataSchema.findOneAndUpdate(condition, update, {
        upsert: true,
        overwrite: false,
        new: true,
      })
      msg.say('playlist created successfully');
    } catch (err) {
      logger.log('error', err);
      return msg.channel.send(`Can't save the playlist`);
    }

  }

}

