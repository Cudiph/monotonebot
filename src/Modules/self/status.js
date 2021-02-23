const Command = require('../../structures/Command.js');

module.exports = class SetStatusCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'setstatus',
      group: 'self',
      memberName: 'status',
      description: 'Set bot status',
      examples: ['setstatus idle'],
      details: 'available status are online, idle, invisible, dnd(do not disturb)',
      guarded: true,
      ownerOnly: true,
      throttling: {
        usages: 2,
        duration: 3600,
      },
      args: [
        {
          key: 'status',
          prompt: 'What bot status do you want to display?',
          type: 'string',
          oneOf: ['online', 'idle', 'invisible', 'dnd'],
        },
      ]
    });
  }

  async run(msg, { status }) {
    // Set username
    msg.client.user.setStatus(status)
      .then(msg.say(`Change status to \`${status}\``))
      .catch(err => {
        msg.say('Something went wrong');
        logger.log('error', err);
      });
  }

};

