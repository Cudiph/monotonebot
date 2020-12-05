const { Command } = require('discord.js-commando');
const { crud } = require('../../library/Database/crud.js');
const { guildSettingsSchema } = require('../../library/Database/schema.js');

module.exports = class VolumeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'volume',
      group: 'voice',
      aliases: ['vol'],
      memberName: 'volume',
      description: 'Set volume of current audio stream from range 1-130',
      examples: ['volume 100', 'vol 5'],
      argsType: 'multiple',
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 20,
      },
      args: [
        {
          key: 'volume',
          prompt: 'How many volume do you want to play?',
          type: 'integer',
          min: 0,
          max: 130,
          default: '',
        }
      ]
    })
  }

  async run(msg, { volume }) {
    volume /= 100;
    if (!msg.guild.me.voice.connection) {
      return msg.say(`I'm not connected to the voice channel`);
    }
    let db = await new crud(process.env.MONGO_URL);
    db.connect();

    if (!volume) {
      let vol = await db.findById(guildSettingsSchema, msg.guild.id);
      return msg.say(`Current volume level is ${vol.volume * 100}`)
    }

    try {
      await db.writeOneUpdate(guildSettingsSchema, msg.guild.id, {
        volume: volume,
      });
      msg.guild.volume = volume;
      msg.say(`Change volume level to ${volume * 100}`)
    } catch (err) {
      logger.log('error', err);
    }
    if (msg.guild.me.voice.connection.dispatcher) {
      msg.guild.me.voice.connection.dispatcher.setVolume(volume);
    }
  }

  async onBlock(msg, reason, data) {
    let parent = await super.onBlock(msg, reason, data);
    parent.delete({ timeout: 9000 });
  }

  onError(err, message, args, fromPattern, result) {
    super.onError(err, message, args, fromPattern, result)
      .then(msgParent => msgParent.delete({ timeout: 9000 }));
  }
}
