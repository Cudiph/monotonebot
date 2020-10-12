const { Command } = require('discord.js-commando')

module.exports = class SetStatusCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'setstatus',
      group: 'self',
      memberName: 'status',
      description: 'Set bot username',
      examples: ['setstatus idle'],
      details: 'available status are online, idle, invisible, dnd(do not disturb)',
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
    msg.client.user.setStatus(args[0])
      .then(msg.say(`Change status to \`${args[0]}\``))
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



