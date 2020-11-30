const { getUserMention } = require('../../library/users/get-cache.js')
const { Command } = require('discord.js-commando');

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

  async run(msg, { user }) {
    // let user = args[0].match(/^<@!?\d+>$/);
    // get user in guild
    if (!user) {
      msg.channel.send(msg.author.displayAvatarURL());
      return;
    } else if (user && msg.guild) {
      // const users = getUserMention(args[0], msg);
      msg.channel.send(user.displayAvatarURL());
      return;
    } else {
      msg.channel.send('requesting avatar with mentioning in dm channel is not supported yet');
    }
  }

  async onBlock(msg, reason, data) {
    let parent = await super.onBlock(msg, reason, data);
    parent.delete({ timeout: 9000 })
  }

  onError(err, message, args, fromPattern, result) {
    super.onError(err, message, args, fromPattern, result)
      .then(msgParent => msgParent.delete({ timeout: 9000 }));
  }
};