const { Command, CommandoMessage } = require('discord.js-commando');

module.exports = class ShuffleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'shuffle',
      group: 'voice',
      memberName: 'shuffle',
      description: 'Randomize next playing track',
      examples: ['shuffle', 'shuffle true'],
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 10,
      },
      args: [
        {
          key: 'turnOn',
          type: 'boolean',
          prompt: 'Argument must be true or false.',
          default: ''
        }
      ]
    })
  }

  /** @param {CommandoMessage} msg */
  async run(msg, { turnOn }) {
    if (turnOn === '') {
      msg.guild.shuffle = !msg.guild.shuffle;
    } else {
      msg.guild.shuffle = turnOn;
    }
    msg.guild.loop = msg.guild.shuffle ? false : msg.guild.loop;
    const embed = {
      color: msg.guild.shuffle ? 0x11ff00 : 0xff1100,
      description: `Set \`shuffle\` to **${msg.guild.shuffle ? 'True' : 'False'}**`
    }
    return msg.say({ embed });
  }


}
