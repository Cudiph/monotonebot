const { Command } = require('discord.js-commando');

module.exports = class LeaveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'leaveme',
      group: 'administration',
      memberName: 'leaveme',
      description: 'Why did u leave me?!',
      examples: ['leaveme'],
      userPermissions: ['KICK_MEMBERS', 'ADMINISTRATOR'],
    });
  }

  run(msg) {
    return msg.say("`Bye`").then(msg => msg.guild.leave());
  }
};