const Discord = require('discord.js');
const Command = require('../../structures/Command.js');

module.exports = class DmCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'dm',
      aliases: ['directmsg', 'email'],
      group: 'util',
      memberName: 'dm',
      description: 'dm someone with mentioning in a server',
      throttling: {
        usages: 2,
        duration: 30,
      },
      examples: ['dm @epicgamers Hello;Nice too meet you', 'email @0xDeadBeef Title;Desc'],
      guildOnly: true,
      args: [
        {
          key: 'user',
          prompt: 'Which user you want to dm?',
          type: 'user',
        },
        {
          key: 'words',
          label: 'Subject & content',
          prompt: 'What do you want to say?',
          type: 'string',
        }
      ],
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg, { user, words }) {
    // spliting args
    const content = words.split(/\s*;\s*/);
    const title = content[0];
    const value = content[1];
    // get user data
    // const users = getUserMention(args[0], msg)
    let EmbedMsg;
    if (content.length > 1) {
      EmbedMsg = new Discord.MessageEmbed()
        .setColor('#ff548e')
        .setTitle(`Subject ${title}`)
        .setDescription(value)
        .setFooter(`Sent by ${msg.author.tag} at guild '${msg.channel.guild.name}'`, msg.author.displayAvatarURL());
    } else {
      EmbedMsg = new Discord.MessageEmbed()
        .setColor('#ff548e')
        .setDescription(title)
        .setFooter(`Sent by ${msg.author.tag} at guild '${msg.channel.guild.name}'`, msg.author.displayAvatarURL());
    }
    user.send(EmbedMsg).then(() => {
      msg.say('Message sent successfully');
    }).catch(err => {
      msg.say('There was a problem during the delivery');
      logger.error(err.stack);
    });

  }
};
