const Discord = require('discord.js');
const { Command } = require('discord.js-commando');
const { sendtoLogChan } = require('../../library/helper/embed.js');

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
      userPermissions: ['KICK_MEMBERS'],
      args: [
        {
          key: 'member',
          prompt: 'Which user to be kicked?',
          type: 'member',
        },
        {
          key: 'reason',
          prompt: 'The reason why you kick him? (optional)',
          type: 'string',
          default: '-',
        }
      ],
    });
  }

  async run(msg, { member, reason }) {
    // // Manual method
    // let member = await isUserId(args[0], msg);
    // let isMember = args[0].match(/^<@!?\d+>$/);
    // // check if the member is exist
    // if (member) {
    //   member = await msg.guild.members.cache.get(args[0]);
    // } else if (isMember) {
    //   member = await getUserMention(args[0], msg);
    // } else {
    //   return msg.say('Invalid Id or Argument');
    // }
    const kickedName = `${member.user.username}#${member.user.discriminator} <${member.user.id}>`;
    const kickedimage = `${member.user.displayAvatarURL()}`;
    try {
      await member.kick(reason);
      const embedMsg = new Discord.MessageEmbed()
        .setColor('#fc6b03')
        .setAuthor(kickedName, kickedimage)
        .setTitle(`Kicked Successfully`)
        .setDescription(`**Member** : ${kickedName}\n` + `**Reason** : ${reason}\n` +
          `**Time** : ${msg.createdAt.toUTCString()}`)
        .setFooter(`Kicked by ${msg.author.username}#${msg.author.discriminator}`,
          `${msg.author.displayAvatarURL()}`);

      return sendtoLogChan(msg, { embedMsg: embedMsg });

    } catch (e) {
      // due to missing permissions or role hierarchy
      msg.reply('I was unable to kick the member');
      logger.log('error', e.stack);
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