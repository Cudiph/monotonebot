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
    const player = this.client.lavaku.getPlayer(msg.guild.id);
    if (!player) {
      return;
    }

    this.client.lavaku.getPlayer(msg.guild.id).emit('closed');
    return player.disconnect();
  }

};
