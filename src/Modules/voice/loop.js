const { Command, CommandoMessage } = require('discord.js-commando');

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
      msg.guild.loop = !msg.guild.loop;
    } else {
      msg.guild.loop = turnOn;
    }
    msg.guild.shuffle = msg.guild.loop ? false : msg.guild.shuffle;
    const embed = {
      color: msg.guild.loop ? 0x11ff00 : 0xff1100,
      description: `Set \`loop\` to **${msg.guild.loop ? 'True' : 'False'}**`
    }
    return msg.say({ embed });
  }

  async onBlock(msg, reason, data) {
    super.onBlock(msg, reason, data)
      .then(blockMsg => blockMsg.delete({ timeout: 10000 }))
      .catch(e => e); // do nothing
  }

  onError(err, message, args, fromPattern, result) {
    super.onError(err, message, args, fromPattern, result)
      .then(msgParent => msgParent.delete({ timeout: 10000 }))
      .catch(e => e); // do nothing
  }
}
