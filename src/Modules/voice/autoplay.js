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
        usages: 1,
        duration: 10,
      },
    })
  }

  async run(msg, args) {
    let arg;
    if (args.length) {
      arg = args[0].toLowerCase();
    }

    if (!args.length) {
      msg.guild.autoplay = !msg.guild.autoplay;
    } else if (arg == 'true') {
      msg.guild.autoplay = true;
    } else if (arg == 'false') {
      msg.guild.autoplay = false;
    } else {
      msg.say('Argument must be true or false');
    }
    let embed = {
      description: `Set \`autoplay\` to **${msg.guild.autoplay ? 'True' : 'False'}**`
    }
    if (msg.guild.autoplay) {
      embed.color = 0x11ff00;
    } else {
      embed.color = 0xff1100;
    }

    return msg.say({embed})
  }

  async onBlock(msg, reason, data) {
    let parent = await super.onBlock(msg, reason, data);
    parent.delete({ timeout: 9000 });
  }

  onError(err, message, args, fromPattern, result) {
    super.onError(err, message, args, fromPattern, result)
      .then(msgParent => msgParent.delete({ timeout: 9000 }));
  }
}
