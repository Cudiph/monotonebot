const Command = require('../../structures/Command.js');

module.exports = class ResumeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'resume',
      group: 'voice',
      memberName: 'resume',
      description: 'Resume current stream',
      examples: ['resume'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 10,
      },
    });
  }

  /** @param {import('discord.js-commando').CommandoMessage} msg */
  async run(msg) {
    if (!msg.guild.me.voice.connection) {
      return msg.say(`I'm not connected to the voice channel`);
    }
    if (msg.guild.me.voice.connection.dispatcher) {
      return msg.guild.me.voice.connection.dispatcher.resume();
    }
  }

};
