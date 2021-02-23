const Discord = require('discord.js');
const Command = require('../../structures/Command.js');

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
      args: [
        {
          key: 'textChannel',
          prompt: 'Which text channel to send? (optional) type first word to continue',
          type: 'text-channel|string',
        },
        {
          key: 'words',
          prompt: 'What do you want to say?',
          type: 'string',
          isEmpty: function(val, msg) {
            const splittedMsg = msg.content.split(/\s+/);
            if (splittedMsg[1].match(/^<#\d+>$/) && !splittedMsg[2]) {
              return true;
            } else {
              return false;
            }
          }
        }
      ],
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg, { textChannel, words }) {
    let channel;
    if (typeof textChannel == 'object') {
      channel = textChannel;
    }

    // embeded msg
    let embedMsg = {
      description: words,
      color: 0xff548e,
    };

    // check if user mention a channel if not send all args in that channel
    if (!channel) {
      embedMsg = new Discord.MessageEmbed()
        .setColor('#ff548e')
        .setDescription(textChannel.concat(' ', words ? words : ''));
      return msg.say(embedMsg);
    }

    // check if the user have perm to send the message
    if (!channel.permissionsFor(msg.author.id).has('SEND_MESSAGES')) {
      return msg.reply(`You don't have a permission for sending messages to that channel`);
    }
    if (!channel.permissionsFor(msg.guild.me.id).has('SEND_MESSAGES')) {
      return msg.reply(`I don't have a permission for sending messages to that channel`);
    }

    channel.send({
      embed: embedMsg
    });

  }
};
