const { Command } = require('discord.js-commando')

module.exports = class SetUsernameCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'setusername',
      group: 'self',
      memberName: 'username',
      description: 'Set bot username',
      examples: ['setusername mylovelybot'],
      guarded: true,
      ownerOnly: true,
      argsType: 'multiple',
      throttling: {
        usages: 2,
        duration: 3600,
      },
    });
  }

  async run(msg, args) {
    // Set username
    msg.client.user.setUsername(args.join(' '))
      .then(user => msg.say(`My new username is ${user.username}`))
      .catch(err => {
        msg.say('Something went wrong');
        logger.log('error', err);
      });
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



