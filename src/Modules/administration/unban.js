const { getUserIdMention } = require('../../library/users/get-cache.js');
module.exports = {
  name: 'unban',
  description: 'Unban a user from the server.',
  usage: '<user>',
  args: true,
  guildOnly: true,
  execute(message, args) {
    if (!message.member.hasPermission("BAN_MEMBERS")) {
      return message.reply(`You do not have permission to do that!`);
    }

    if (!message.guild.me.hasPermission("BAN_MEMBERS")) {
      return message.channel.send(`**${message.author.username}**, I do not have permission to unban someone`);
    }

    let id = getUserIdMention(args[0], message);
    if (id) {
      message.guild.members.unban(id, args.slice(1).join(' '))
        .then(user => message.channel.send(`Unbanned **${user.username}#${user.discriminator}** from **${message.guild.name}**`))
        .catch(err => {
          // due to missing permissions or role hierarchy
          message.reply('I was unable to unban the member\n' +
            '**Error name** : ' + err.toString().split(':').slice(1).join());
          // Log the error
          logger.log('error', err);
        });

    } else {
      message.reply(`You didn't mention user to unban`);
    }

  }
}