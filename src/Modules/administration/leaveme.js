const { Command } = require('discord.js-commando');

module.exports = class LeaveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'leaveme',
      group: 'administration',
      memberName: 'leaveme',
      description: 'Why did u leave me?!',
      examples: ['leaveme'],
      userPermissions: ['ADMINISTRATOR'],
    });
  }

  run(msg) {
    return msg.say("`Bye`").then(msg => msg.guild.leave());
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