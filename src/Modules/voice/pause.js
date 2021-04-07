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
    });
  }

  /** @param {import('discord.js-commando').CommandoMessage} msg */
  async run(msg) {
    const player = this.client.lavaku.getPlayer(msg.guild.id);
    if (!player?.paused) {
      player.setPaused(true).catch(e => {
        msg.said(`Failed to pause the player: ${e.message}`);
      });
    }
  }

};
