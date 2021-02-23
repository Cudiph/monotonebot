const Command = require('../../structures/Command.js');

module.exports = class LeaveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'leave',
      group: 'voice',
      memberName: 'leave',
      description: 'leave voice channel',
      examples: ['leave'],
      guildOnly: true,
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg) {
    if (!msg.guild.me.voice.channel) {
      return;
    }

    if (!msg.member.voice.channel || msg.member.voice.channel.id !== msg.guild.me.voice.channel.id) {
      // send msg if author not connected to the same voice channel
      return msg.reply("You must join to my voice channel");
    }

    return msg.member.voice.channel.leave();
  }

};
