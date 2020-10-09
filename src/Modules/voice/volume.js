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
      description: 'Set volume of current audio stream from range 1-100',
      examples: ['volume 100', 'vol 5'],
      argsType: 'multiple',
      guildOnly: true,
      throttling: {
        usages: 3,
        duration: 10,
      },
    })
  }

  async run(msg, args) {
    if (!msg.guild.me.voice.connection) {
      return msg.say(`I'm not connected to the voice channel`);
    }
    let db = await new crud(process.env.MONGO_URL);
    db.connect();

    if (!args.length) {
      let vol = await db.findById(guildSettingsSchema, msg.guild.id);
      return msg.say(`Current volume level is ${vol.volume * 100}`)
    }

    if (isNaN(args[0])) {
      return msg.say('argument must be a number');
    }

    let intArg = parseInt(args[0]);

    if (intArg < 1 || intArg > 100) {
      return msg.say('Please provide an argument between 1-100')
        .then(msg => msg.delete({ timeout: 10000 }));
    } else {
      intArg /= 100;
    }


    try {
      await db.writeOneUpdate(guildSettingsSchema, msg.guild.id, {
        volume: intArg,
      });
      msg.guild.volume = intArg;
      msg.say(`Change volume level to ${intArg * 100}`)
    } catch (err) {
      logger.log('error', err);
    }
    if (msg.guild.me.voice.connection.dispatcher) {
      msg.guild.me.voice.connection.dispatcher.setVolume(intArg);
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
