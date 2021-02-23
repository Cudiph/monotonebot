const Command = require('../../structures/Command.js');

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
      throttling: {
        usages: 2,
        duration: 3600,
      },
      args: [
        {
          key: 'username',
          prompt: 'What username do you want to assigned to the bot?',
          type: 'string',
        },
      ]
    });
  }

  async run(msg, { username }) {
    // Set username
    msg.client.user.setUsername(username)
      .then(user => msg.say(`My new username is **${user.username}**`))
      .catch(err => {
        msg.say('Something went wrong');
        logger.log('error', err);
      });
  }

};

