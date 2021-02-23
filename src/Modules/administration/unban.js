const { Command } = require('discord.js-commando');


module.exports = class UnbanCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'unban',
      group: 'administration',
      memberName: 'unban',
      description: 'Unban someone with mentioning or by id',
      examples: ['unban @someone', 'unban @someone Your reason here', 'unban 623491289324'],
      guarded: true,
      guildOnly: true,
      argsType: 'multiple',
      clientPermissions: ['BAN_MEMBERS'],
      userPermissions: ['BAN_MEMBERS'],
      args: [
        {
          key: 'bannedUser',
          prompt: 'Which user to be unbanned?',
          type: 'member',
        },
        {
          key: 'reason',
          prompt: 'The reason why you unbanned him? (optional)',
          type: 'string',
          default: '',
        }
      ],
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg, { bannedUser, reason }) {
    // // old method
    // let bannedUser;
    // let isMember = args[0].match(/^<@!?\d+>$/);
    // if (!isMember) bannedUser = await msg.guild.fetchBan(args[0]);
    // // check whether the id is valid
    // if (bannedUser) {
    //   bannedUser = args[0];
    // } else if (isMember) {
    //   bannedUser = await getUserIdMention(args[0], msg);
    // } else {
    //   return msg.say('Invalid Id or Argument');
    // }

    msg.guild.members.unban(bannedUser, reason)
      .then(user => {
        const res = `Unbanned **${user.username}#${user.discriminator}** from **${msg.guild.name}**`;
        return msg.sendtoLogChan({ strMsg: res });
      })
      .catch(err => {
        // due to missing permissions or role hierarchy
        msg.reply('I was unable to unban the member\n' +
          '**Error name** : ' + err.toString().split(':').slice(1).join());
        // Log the error
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
