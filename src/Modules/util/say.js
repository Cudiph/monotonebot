const Discord = require('discord.js');
const { getChannelMention } = require('../../library/users/get-cache.js');
const { Command } = require('discord.js-commando');

module.exports = class SayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'say',
      group: 'util',
      memberName: 'say',
      description: 'Repeat what have you saying',
      argsType: 'multiple',
      throttling: {
        usages: 1,
        duration: 5,
      },
      examples: ['say Hello Dear', 'say #announcement Announcement \n\n I\'m live on twitch'],
    });
  }

  async run(msg, args) {
    let channel;
    let isChannel = args[0].match(/^<#\d+>$/);
    if (isChannel) {
      channel = getChannelMention(args[0], msg);
    }

    // embeded msg
    let embedMsg = {
      description: args.slice(1).join(' '),
      color: 0xff548e,
    }

    if (!channel) {
      let embedMsg = new Discord.MessageEmbed()
        .setColor('#ff548e')
        .setDescription(args.join(' '));
      return msg.channel.send(embedMsg);
    }

    if (!channel.permissionsFor(msg.author.id).has('SEND_MESSAGES')) {
      return msg.channel.send(`You don't have a permission for sending messages to that channel`);
    }

    channel.send({
      embed: embedMsg
    });

  }
}
