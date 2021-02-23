const { Command } = require('discord.js-commando');
const Discord = require('discord.js');


module.exports = class BanCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ban',
      group: 'administration',
      memberName: 'ban',
      description: 'Ban someone with mentioning or by id',
      examples: ['ban @someone', 'ban @someone Bad words', 'ban 71283497224353324 Your reason here'],
      guildOnly: true,
      clientPermissions: ['BAN_MEMBERS'],
      userPermissions: ['BAN_MEMBERS'],
      args: [
        {
          key: 'member',
          prompt: 'Which user to be banned?',
          type: 'member',
        },
        {
          key: 'reason',
          prompt: 'The reason why you ban him? (optional)',
          type: 'string',
          default: '-',
        }
      ],
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg, { member, reason }) {
    // // manual method
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

    // get the banned data
    const bannedName = `${member.user.username}#${member.user.discriminator} <${member.user.id}>`;
    const bannedImage = `${member.user.displayAvatarURL()}`;
    if (member) {
      try {
        await member.ban({ reason: reason });
        const embedMsg = new Discord.MessageEmbed()
          .setColor('#ff0000')
          .setAuthor(bannedName, bannedImage)
          .setTitle(`Banned Successfully`)
          .setDescription(`**Member** : ${bannedName}\n` + `**Reason** : ${reason}\n` +
            `**Time** : ${msg.createdAt.toUTCString()}`)
          .setFooter(`Banned by ${msg.author.username}#${msg.author.discriminator}`,
            `${msg.author.displayAvatarURL()}`);

        return msg.sendtoLogChan({ embedMsg: embedMsg });
      } catch (e) {
        // due to missing permissions or role hierarchy
        msg.reply(`I was unable to ban the member`);
        logger.log('error', e.stack);
      }

    } else { // Otherwise, if no user was mentioned
      msg.reply("You didn't mention the user to ban!");
    }
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

