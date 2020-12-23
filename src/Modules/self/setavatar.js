const { Command } = require('discord.js-commando');

module.exports = class SetAvatarCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'setavatar',
      group: 'self',
      memberName: 'setavatar',
      description: 'set avatar from given url',
      examples: ['setavatar C:\\Users\\User\\Pictures\\minecraft\\creeper.png',
        'setavatar https://upload.wikimedia.org/wikipedia/fr/thumb/0/05/Discord.svg/1200px-Discord.svg.png'],
      ownerOnly: true,
      args: [
        {
          key: 'path',
          prompt: 'Where is the picture of your avatar? (url or local path)',
          type: 'string',
        },
      ]
    });
  }

  async run(msg, { path }) {
    const isLink = path.match(/(?:https?|\.\/|\w:(\\|\/)).*(?:png|jpg|jpeg)/);
    if (!isLink) {
      return msg.say('Please check the path or link');
    }
    msg.client.user.setAvatar(path)
      .then(msg.say(`Avatar will be updated soon`))
      .catch(err => {
        msg.say('Please check your url.\nError : ' + err);
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

