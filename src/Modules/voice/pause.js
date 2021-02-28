const Command = require('../../structures/Command.js');

module.exports = class PauseCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'pause',
      group: 'voice',
      memberName: 'pause',
      description: 'Pause current stream',
      examples: ['pause'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 15,
      },
      args: [
        {
          key: 'silencePause',
          prompt: 'use silencePause?',
          type: 'boolean',
          default: false,
        },
      ]
    });
  }

  /** @param {import('discord.js-commando').CommandoMessage} msg */
  async run(msg, { silencePause }) {
    if (!msg.guild.me.voice.connection) {
      return msg.say(`I'm not connected to the voice channel`);
    } else if (msg.guild.me.voice.connection.dispatcher) {
      return msg.guild.me.voice.connection.dispatcher.pause(silencePause);
    }
  }

};
