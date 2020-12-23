const { Command } = require('discord.js-commando');

module.exports = class SetActivityCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'setactivity',
      group: 'self',
      memberName: 'setactivity',
      description: 'Set bot activity',
      examples: ['setactivity Playing ..help to display help command'],
      details: 'available activity are PLAYING, STREAMING, LISTENING, WATCHING.',
      guarded: true,
      ownerOnly: true,
      args: [
        {
          key: 'activity',
          prompt: 'What activity you want to set?',
          type: 'string',
          oneOf: ['playing', 'streaming', 'listening', 'watching', 'none'],
        },
        {
          key: 'description',
          prompt: 'What description you want to set?',
          type: 'string',
          default: '',
        }
      ]
    });
  }

  async run(msg, { activity, description }) {
    msg.client.user.setActivity(description, { type: activity.toUpperCase() })
      .then(presence => {
        if (activity.toLowerCase() != 'none' && description != '') {
          msg.say(`Activity set to **${activity.toUpperCase()} ${presence.activities[0].name}**`);
        } else {
          msg.say(`Activity has been reset`);
        }
      }).catch(err => {
        msg.say('Please check your syntax');
        logger.log('error', err);
      });
  }

  async onBlock(msg, reason, data) {
    super.onBlock(msg, reason, data)
      .then(blockMsg => blockMsg.delete({ timeout: 10000 }))
      .catch(e => e); // do nothing
  }

  onError(err, message, args, fromPattern, result) {
    super.onError(err, message, args, fromPattern, result)
      .then(msgParent => msgParent.delete({ timeout: 10000 }))
      .catch(e => e); // do nothing
  }
};

