const Discord = require('discord.js');
const { getUserMention } = require('../../library/users/get-cache.js');
const { Command } = require('discord.js-commando');

module.exports = class DmCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'dm',
      aliases: ['directmsg'],
      group: 'util',
      memberName: 'dm',
      description: 'dm someone with mentioning',
      throttling: {
        usages: 1,
        duration: 30,
      },
      examples: ['dm Hello;Nice too meet you', 'dm Title;Desc'],

    });
  }

  async run(msg, args) {
    let argsList = args.split(/ +/);
      // spliting args
      const content = argsList.slice(1).join(' ').split(';');
      const title = content[0]
      const value = content[1]
      // get user data
      const users = getUserMention(argsList[0], msg)
      const EmbedMsg = new Discord.MessageEmbed()
        .setColor('#ff548e')
        .setFooter(`Sent by ${msg.author.username} at guild '${msg.channel.guild.name}'`)
        .addField('Subject: ' + title, value)
      users.send(EmbedMsg).then(() => {
        msg.channel.send('Message sent successfully');
      }).catch(err => {
        msg.channel.send('There was a problem during the delivery');
        logger.log('error', err);
      })

  }
}
