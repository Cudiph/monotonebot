const Discord = require('discord.js');
const {
  getUserMention
} = require('../../library/users/getUser.js')

module.exports = {
  name: 'kick',
  description: 'Kick a user from the server.',
  usage: '<user>',
  args: true,
  guildOnly: true,
  execute(message, args) {
    if (!message.member.hasPermission("KICK_MEMBERS")) {
      return message.reply(`You do not have permission to do that!`);
    }

    if (!message.guild.me.hasPermission("KICK_MEMBERS")) {
      return message.channel.send(`**${message.author.username}**, I do not have permission to kick !`);
    }
    
    const member = getUserMention(args[0], message);
    const kickedName = `${member.user.username}#${member.user.discriminator} <${member.user.id}>`;
    const kickedimage = `${member.user.displayAvatarURL()}`;
    if (member) {
      // There are big differences between a user and a member
      member
        .kick(args.slice(1).join(' '))
        .then(() => {
          const EmbedMsg = new Discord.MessageEmbed()
            .setColor('#fc6b03')
            .setAuthor(kickedName, kickedimage)
            .setTitle(`Kicked Successfully`)
            .setDescription(`**Member** : ${kickedName}\n` + `**Reason** : ${args.slice(1).join(' ') || '-'}\n` +
              `**Time** : ${message.createdAt.toUTCString()}`)
            .setFooter(`Kicked by ${message.author.username}#${message.author.discriminator}`,
              `${message.author.displayAvatarURL()}`);

          message.channel.send({
            embed: EmbedMsg
          });
        })
        .catch(err => {
          // due to missing permissions or role hierarchy
          message.reply('I was unable to kick the member');
          // Log the error
          console.error(err);
        });
    }
    // Otherwise, if no user was mentioned
    else {
      message.reply("You didn't mention the user to kick!");
    }
  }
}