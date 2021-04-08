const Command = require('../../structures/Command.js');

module.exports = class StopCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'stop',
      group: 'voice',
      memberName: 'stop',
      description: 'Stop current Track and move to the end of queue',
      examples: ['stop'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 10,
      },
      args: [
        {
          key: 'deleteQueue',
          label: 'DeleteQueue?',
          prompt: 'Delete the queue?',
          type: 'boolean',
          default: false,
        }
      ]
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg, { deleteQueue }) {
    const player = this.client.lavaku.getPlayer(msg.guild.id);

    if (!player) return;

    msg.guild.indexQueue = msg.guild.queue.length;
    msg.guild.autoplay = false;
    msg.guild.loop = false;
    msg.guild.loopQueue = false;
    player.stopTrack();

    if (deleteQueue) {
      msg.guild.resetPlayer();
    }
  }

};
