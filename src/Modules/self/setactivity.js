const { Command } = require('discord.js-commando')

module.exports = class SetActivityCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'setactivity',
      group: 'self',
      memberName: 'activity',
      description: 'Set bot activity',
      examples: ['setactivity Playing ..help to display help command'],
      details: 'available activity are PLAYING, STREAMING, LISTENING, WATCHING.',
      guarded: true,
      ownerOnly: true,
      argsType: 'multiple',
    });
  }

  async run(msg, args) {
    msg.client.user.setActivity(args.slice(1).join(' '), { type: args[0].toUpperCase() })
      .then(presence => msg.say(`Activity set to ${presence.activities[0].name}`))
      .catch(err => {
        msg.say('Please check your syntax');
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



