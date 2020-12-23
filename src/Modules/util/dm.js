const Discord = require('discord.js');
const { Command } = require('discord.js-commando');

module.exports = class DmCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'dm',
      aliases: ['directmsg', 'email'],
      group: 'util',
      memberName: 'dm',
      description: 'dm someone with mentioning in a server',
      throttling: {
        usages: 1,
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
        .setFooter(`Sent by ${msg.author.username}#${msg.author.discriminator} at guild '${msg.channel.guild.name}'`, msg.author.displayAvatarURL());
    } else {
      EmbedMsg = new Discord.MessageEmbed()
        .setColor('#ff548e')
        .setDescription(title)
        .setFooter(`Sent by ${msg.author.username}#${msg.author.discriminator} at guild '${msg.channel.guild.name}'`, msg.author.displayAvatarURL());
    }
    user.send(EmbedMsg).then(() => {
      msg.channel.send('Message sent successfully');
    }).catch(err => {
      msg.channel.send('There was a problem during the delivery');
      logger.log('error', err);
    });

  }
};
