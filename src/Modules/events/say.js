const Discord = require('discord.js');
const { getChannelMention } = require('../../library/users/get-cache.js')

module.exports = {
  name: 'say',
  description: 'Send a message to this or specified channel',
  args: true,
  guildOnly: true,
  execute(message, args) {
    if (args[0].match(/^<#\d+>$/)) {
      var channel = getChannelMention(args[0], message);
    }

    // embeded message
    let embedMsg = {
      description: args.slice(1).join(' '),
      color: 0xff548e,
    }

    if (!channel) {
      let embedMsg = new Discord.MessageEmbed()
        .setColor('#ff548e')
        .setDescription(args.join(' '));
      message.channel.send(embedMsg);
      return;
    }

    if (!channel.permissionsFor(message.author.id).has('SEND_MESSAGES')) {
      return message.channel.send(`You don't have a permission for sending messages to that channel`);
    }

    channel.send({
      embed: embedMsg
    });

  }
}