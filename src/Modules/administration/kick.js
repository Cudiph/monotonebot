const Discord = require('discord.js');
const { getUserMention, isUserId } = require('../../library/users/get-cache.js')
const { Command } = require('discord.js-commando')

module.exports = class KickCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'kick',
      group: 'administration',
      memberName: 'kick',
      description: 'Kick someone with mentioning or by id',
      examples: ['kick @someone', 'kick @someone Bad words', 'kick 71283497224353324 Your reason here'],
      guarded: true,
      guildOnly: true,
      argsType: 'multiple',
      clientPermissions: ['KICK_MEMBERS'],
      userPermissions: ['KICK_MEMBERS']
    });
  }

  async run(msg, args) {
    let member = await isUserId(args[0], msg);
    let isMember = args[0].match(/^<@!?\d+>$/);
    // check if the member is exist
    if (member) {
      member = await msg.guild.members.cache.get(args[0]);
    } else if (isMember) {
      member = await getUserMention(args[0], msg);
    } else {
      return msg.say('Invalid Id or Argument');
    }
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
              `**Time** : ${msg.createdAt.toUTCString()}`)
            .setFooter(`Kicked by ${msg.author.username}#${msg.author.discriminator}`,
              `${msg.author.displayAvatarURL()}`);

          msg.channel.send({
            embed: EmbedMsg
          });
        })
        .catch(err => {
          // due to missing permissions or role hierarchy
          msg.reply('I was unable to kick the member');
          // Log the error
          logger.log('error', err);
        });
    }
    else {
      return msg.reply("You didn't mention the user to kick!");
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