const Command = require('../../structures/Command.js');

module.exports = class AvatarCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'avatar',
      aliases: ['icon'],
      group: 'search',
      memberName: 'avatar',
      description: 'Return your avatar or someone else\'s avatar if any mention',
      examples: ['avatar', 'avatar @someone'],
      throttling: {
        usages: 1,
        duration: 10,
      },
      argsType: 'multiple',
      args: [
        {
          key: 'user',
          prompt: 'Which user you want to display the avatar for?',
          type: 'user',
          default: '',
        }
      ],
    });
  }

  /** @param {import('discord.js-commando').CommandoMessage} msg */
  async run(msg, { user }) {
    // let user = args[0].match(/^<@!?\d+>$/);
    // get user in guild
    if (!user) {
      msg.say(msg.author.displayAvatarURL());
      return;
    } else if (user && msg.guild) {
      // const users = getUserMention(args[0], msg);
      msg.say(user.displayAvatarURL());
      return;
    } else {
      msg.say('requesting avatar with mentioning in dm channel is not supported yet');
    }
  }

};
