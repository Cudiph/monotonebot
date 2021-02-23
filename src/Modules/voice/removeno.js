const { oneLine } = require('common-tags');
const Command = require('../../structures/Command.js');


module.exports = class RemoveNumberCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'removeno',
      group: 'voice',
      aliases: ['rmno'],
      memberName: 'removeno',
      description: 'Remove given number from queue list',
      details: oneLine`
        When you remove a track while in shuffle mode,
        the original queue is not affected.
      `,
      examples: ['removeno 5', 'rmno 2-5'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 10,
      },
      args: [
        {
          key: 'rangeIndex',
          prompt: 'What is the range of numbers do you want to delete? (slicing with "-")',
          type: 'string',
          min: 0,
        }
      ]
    });
  }

  /** @param {import('discord.js-commando').CommandoMessage} msg */
  async run(msg, { rangeIndex }) {
    // split from "2-5" and map to int like [2, 5]
    const args = rangeIndex.split(/\s*-\s{0,}/).map(x => +x);

    // handler
    if (!msg.guild.queue || !msg.guild.queue.length) {
      return msg.reply('There are no songs to remove');
    } else if (isNaN(args[0]) || args[1] && isNaN(args[1])) {
      return msg.reply('Please give a valid argument').then(resMsg => resMsg.delete({ timeout: 9000 }));
    } else if (parseInt(args[0]) > parseInt(args[1])) {
      return msg.reply('Bad calculation').then(resMsg => resMsg.delete({ timeout: 9000 }));
    }
    if (args < 0 || args >= msg.guild.queue.length) {
      return msg.reply(`Current total queue is 0-${msg.guild.queue.length - 1}`);
    }

    let end; // number of track to remove
    if (!args[1]) end = 1;
    else end = args[1] - args[0] + 1;

    const removed = msg.guild.queue.splice(args[0], end);

    if ((msg.guild.indexQueue >= args[0]) && (msg.guild.indexQueue < (args[0] + end))) {
      // example condition : rmno 2-5 when indexQueue at 3 or in range 2-5
      // then move indexQ to before the removed track so indexQ must be 1
      msg.guild.indexQueue = args[0] - 1;
    } else if (msg.guild.indexQueue >= args[0]) {
      // example condition : rmno 2-5 when indexQueue at 6 or higher
      msg.guild.indexQueue -= removed.length;
    }
    msg.say('Removed succesfully')
      .then(resMsg => resMsg.delete({ timeout: 7000 }))
      .catch(e => e);
  }

};
