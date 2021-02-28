const Command = require('../../structures/Command.js');

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
    return msg.say("`Bye`").then(byeMsg => byeMsg.guild.leave());
  }

};
