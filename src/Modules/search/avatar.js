const { getUserMention } = require('../../library/users/get-cache.js')
const { Command } = require('discord.js-commando');

module.exports = class pingCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'avatar',
      aliases: ['icon'],
      group: 'search',
      memberName: 'avatar',
      description: 'Return your avatar or someone else\'s avatar if any mention',
      examples: ['avatar', 'avatar @someone'],
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 10,
      },
      args: [
        {
          key: 'user',
          prompt: 'Which user u want to show?',
          type: 'string',
          default: ''
        }
      ],
      defaultHandling: false,
    });
  }

  async run(msg, args) {
    let argList = args.user.split(/ +/);
    // get user in guild
    const users = getUserMention(argList[0], msg);
    if (!argList[0]) {
      msg.channel.send(msg.author.displayAvatarURL());
      return;
    } else if (users && msg.guild) {
      msg.channel.send(users.user.displayAvatarURL());
      return;
    } else {
      msg.channel.send('Invalid Arguments');
    }
  }
};