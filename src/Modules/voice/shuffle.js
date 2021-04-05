const { oneLine } = require('common-tags');
const Command = require('../../structures/Command.js');

module.exports = class ShuffleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'shuffle',
      group: 'voice',
      memberName: 'shuffle',
      description: 'Shuffle current queue',
      details: oneLine`
        If set to true, the current queue will be randomized but original queue
        still remain in the memory. Set to false to load the original queue.
      `,
      examples: ['shuffle'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 30,
      },
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg) {
    if (!msg.guild.queue || !msg.guild.queue.length) {
      return msg.reply(`The queue is empty.`);
    }
    msg.guild.shuffle = !msg.guild.shuffle;
    if (msg.guild.shuffle) {
      msg.guild.loop = false;
      msg.guild.queueTemp = msg.guild.queue.slice();
      msg.guild.shuffleQueue();
    } else {
      msg.guild.queue = msg.guild.queueTemp.slice();
      msg.guild.queueTemp = [];
    }
    const embed = {
      color: msg.guild.shuffle ? 0x11ff00 : 0xff1100,
      description: `Set \`shuffle\` to **${msg.guild.shuffle ? 'True' : 'False'}**`
    };
    return msg.say({ embed });
  }


};
