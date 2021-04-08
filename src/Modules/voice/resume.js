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
    const player = this.client.lavaku.getPlayer(msg.guild.id);
    if (player?.paused) {
      player.setPaused(false).catch(e => {
        msg.said(`Failed to resume the player: ${e.message}`);
      });
    }
  }

};
