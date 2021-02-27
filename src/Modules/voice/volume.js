const Command = require('../../structures/Command.js');
const { guildSettingsSchema } = require('../../util/schema.js');

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
        duration: 15,
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
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg, { volume }) {
    volume /= 100;
    if (!volume) {
      return msg.say(`Current volume level is ${msg.guild.volume * 100}`);
    }
    if (!msg.guild.me.voice.connection) {
      return msg.say(`I'm not connected to the voice channel`);
    }

    try {
      await guildSettingsSchema.findOneAndUpdate({ guildId: msg.guild.id }, {
        volume: volume,
      });
      msg.guild.volume = volume;
      msg.say(`Change volume level to ${volume * 100}`);
    } catch (err) {
      logger.log('error', err);
      msg.say(`Can't update stream volume, please try again later`);
    }
    if (msg.guild.me.voice.connection.dispatcher) {
      msg.guild.me.voice.connection.dispatcher.setVolume(volume);
    }
  }

};
