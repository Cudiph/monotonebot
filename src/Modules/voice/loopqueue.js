const Command = require('../../structures/Command.js');

module.exports = class LoopQueueCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'loopqueue',
      group: 'voice',
      memberName: 'loopqueue',
      aliases: ['loopq'],
      description: 'Loop current queue',
      examples: ['loopqueue', 'loopq'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 30,
      },
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg) {
    msg.guild.loopQueue = !msg.guild.loopQueue;
    const embed = {
      color: msg.guild.loopQueue ? 0x11ff00 : 0xff1100,
      description: `Set \`loopQueue\` to **${msg.guild.loopQueue ? 'True' : 'False'}**`
    };
    return msg.say({ embed });
  }

};
