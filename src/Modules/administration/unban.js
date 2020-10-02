const { getUserIdMention, isUserId } = require('../../library/users/get-cache.js')
const { Command } = require('discord.js-commando')

module.exports = class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'unban',
      group: 'administration',
      memberName: 'unban',
      description: 'Unban someone with mentioning or by id',
      examples: ['unban @someone', 'unban @someone Your reason here','unban 623491289324'],
      guarded: true,
      guildOnly: true,
      argsType: 'multiple',
      clientPermissions: ['BAN_MEMBERS'],
      userPermissions: ['BAN_MEMBERS']
    });
  }

  async run(msg, args) {
    let bannedUser = await msg.guild.fetchBan(args[0]);
    let isMember = args[0].match(/^<@!?\d+>$/);
    // check whether the id is valid
    if (bannedUser) {
      bannedUser = args[0];
    } else if (isMember) {
      bannedUser = await getUserIdMention(args[0], msg);
    } else {
      return msg.say('Invalid Id or Argument');
    }

    if (bannedUser) {
      msg.guild.members.unban(bannedUser, args.slice(1).join(' '))
        .then(user => msg.channel.send(`Unbanned **${user.username}#${user.discriminator}** from **${msg.guild.name}**`))
        .catch(err => {
          // due to missing permissions or role hierarchy
          msg.reply('I was unable to unban the member\n' +
            '**Error name** : ' + err.toString().split(':').slice(1).join());
          // Log the error
          logger.log('error', err);
        });

    } else {
      msg.reply(`You didn't mention user to unban`);
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
