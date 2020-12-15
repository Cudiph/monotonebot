const { Command } = require('discord.js-commando');

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
        usages: 1,
        duration: 10,
      },
      args: [
        {
          key: 'silencePause',
          prompt: 'use silencePause?',
          type: 'boolean',
          default: false,
        },
      ]
    })
  }

  async run(msg, { silencePause }) {
    if (!msg.guild.me.voice.connection) {
      return msg.say(`I'm not connected to the voice channel`);
    } else if (msg.guild.me.voice.connection.dispatcher) {
      return msg.guild.me.voice.connection.dispatcher.pause(silencePause);
    }
  }

  async onBlock(msg, reason, data) {
    super.onBlock(msg, reason, data)
      .then(blockMsg => blockMsg.delete({ timeout: 10000 }))
      .catch(e => e); // do nothing
  }

  onError(err, message, args, fromPattern, result) {
    super.onError(err, message, args, fromPattern, result)
      .then(msgParent => msgParent.delete({ timeout: 10000 }))
      .catch(e => e); // do nothing
  }
}
