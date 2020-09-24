const Discord = require('discord.js');
const { getUserMention } = require('../../library/users/get-cache.js')
module.exports = {
  name: 'dm',
  description: 'Send a DM',
  args: true,
  guildOnly: true,
  execute(message, args) {
    // spliting args
    const msg = args.slice(1).join(' ').split(';')
    const title = msg[0]
    const content = msg[1]
    // get user data
    const users = getUserMention(args[0], message)
    const EmbedMsg = new Discord.MessageEmbed()
      .setColor('#ff548e')
      .setFooter(`Sent by ${message.author.username} at guild '${message.channel.guild.name}'`)
      .addField('Subject: ' + title, content)
    users.send(EmbedMsg).then(() => {
      message.channel.send('Message sent successfully');
    }).catch(err => {
      message.channel.send('There was a problem during the delivery');
      logger.log('error', err);
    })
  }
}