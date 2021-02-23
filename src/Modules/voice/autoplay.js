const { Command } = require('discord.js-commando');

module.exports = class AutoPlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'autoplay',
      group: 'voice',
      memberName: 'autoplay',
      description: 'Play related track when in the end of the queue',
      examples: ['autoplay', 'autoplay false'],
      guildOnly: true,
      argsType: 'multiple',
      throttling: {
        usages: 2,
        duration: 10,
      },
      args: [
        {
          key: 'turnOn',
          type: 'boolean',
          prompt: 'Argument must be true or false',
          default: ''
        }
      ]
    });
  }

  /** @param {import('discord.js-commando').CommandoMessage} message */
  async run(msg, { turnOn }) {
    if (turnOn === '') {
      msg.guild.autoplay = !msg.guild.autoplay;
    } else {
      msg.guild.autoplay = turnOn;
    }
    const embed = {
      description: `Set \`autoplay\` to **${msg.guild.autoplay ? 'True' : 'False'}**`
    };
    if (msg.guild.autoplay) {
      embed.color = 0x11ff00;
    } else {
      embed.color = 0xff1100;
    }

    if (msg.guild.queue && msg.guild.queue.length && (msg.guild.indexQueue >= msg.guild.queue.length)) {
      msg.guild.play(msg);
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
};
