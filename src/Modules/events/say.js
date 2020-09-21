const Discord = require('discord.js');

module.exports = {
  name: 'say',
  description: 'Send a message to this or specified channel',
  args: true,
  guildOnly: true,
  execute(message, args) {
    // embeded message
    const embedMsg = {
      description: args.slice(1).join(' '),
      color: 0xff548e,
    }

    // the specified channel
    const channel = message.guild.channels.cache.get(args[0].slice(2, -1));
    if (!channel) {
      let embedMsg = new Discord.MessageEmbed()
        .setColor('#ff548e')
        .setDescription(args.join(' '));
      message.channel.send(embedMsg);
      return;
    }
    channel.send({
      embed: embedMsg
    });

  }
}