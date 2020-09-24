const Discord = require('discord.js');
const {
  getUserMention
} = require('../../library/users/getUser.js')

module.exports = {
  name: 'ban',
  description: 'Ban a user from the server.',
  usage: '<user>',
  args: true,
  guildOnly: true,
  execute(message, args) {
    if (!message.member.hasPermission("BAN_MEMBERS")) {
      return message.reply(`You do not have permission to do that`);
    }

    if (!message.guild.me.hasPermission("BAN_MEMBERS")) {
      return message.channel.send(`Sadly, I do not have permission to ban someone`);
    }

    const member = getUserMention(args[0], message);
    const bannedName = `${member.user.username}#${member.user.discriminator} <${member.user.id}>`;
    const bannedimage = `${member.user.displayAvatarURL()}`;
    if (member) {
      // There are big differences between a user and a member
      member
        .ban({ reason: args.slice(1).join(' ') })
        .then(() => {
          const EmbedMsg = new Discord.MessageEmbed()
            .setColor('#fc6b03')
            .setAuthor(bannedName, bannedimage)
            .setTitle(`Banned Successfully`)
            .setDescription(`**Member** : ${bannedName}\n` + `**Reason** : ${args.slice(1).join(' ') || '-'}\n` +
              `**Time** : ${message.createdAt.toUTCString()}`)
            .setFooter(`Banned by ${message.author.username}#${message.author.discriminator}`,
              `${message.author.displayAvatarURL()}`);

          message.channel.send({
            embed: EmbedMsg
          });
        })
        .catch(err => {
          // due to missing permissions or role hierarchy
          message.reply('I was unable to ban the member');
          // Log the error
          logger.log('error', err);
        });
    }
    // Otherwise, if no user was mentioned
    else {
      message.reply("You didn't mention the user to ban!");
    }
  }
}