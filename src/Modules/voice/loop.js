const Command = require('../../structures/Command.js');

module.exports = class LoopCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'loop',
      group: 'voice',
      memberName: 'loop',
      description: 'Loop current playing track',
      examples: ['loop', 'loop false'],
      guildOnly: true,
      throttling: {
        usages: 2,
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
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg, { turnOn }) {
    if (turnOn === '') {
      msg.guild.loop = !msg.guild.loop;
    } else {
      msg.guild.loop = turnOn;
    }
    const embed = {
      color: msg.guild.loop ? 0x11ff00 : 0xff1100,
      description: `Set \`loop\` to **${msg.guild.loop ? 'True' : 'False'}**`
    };
    return msg.say({ embed });
  }

};
