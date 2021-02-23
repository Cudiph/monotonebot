const { stripIndents } = require('common-tags');
const Command = require('../../structures/Command.js');
const { guildSettingsSchema } = require('../../library/Database/schema.js');


module.exports = class GoodbyeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'setgoodbye',
      group: 'administration',
      memberName: 'setgoodbye',
      description: 'Set a goodbye message to your new member',
      details: stripIndents`
        Custom variable are:
        \`{{@user}}\` to mention the user
        \`{{user}}\` in the message will be replaced to "username#discrimantor"
        \`{{guild}}\` to return guild name
        \`{{members}}\` to return guild member count
        Put the variable in the goodbyeMsg arg.
        To reset this configuration, you can type "unset" after command like in
        the examples below.
      `,
      examples: ['setgoodbye #arrival "So long {{user}}"', 'setgoodbye unset'],
      guildOnly: true,
      clientPermissions: ['SEND_MESSAGES'],
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          key: 'channel',
          prompt: 'Which channel will the goodbye message be sent?',
          type: 'text-channel|string',
        },
        {
          key: 'goodbyeMsg',
          prompt: 'What message do you want to leave for the old member?',
          type: 'string',
          isEmpty: function(_val, msg) {
            const splittedMsg = msg.content.split(/\s+/);
            if (splittedMsg[1].match(/^<#\d+>$/) && !splittedMsg[2]) {
              return true;
            } else {
              return false;
            }
          }
        }
      ],
      throttling: {
        usages: 2,
        duration: 300,
      }
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg, { channel, goodbyeMsg }) {
    if (typeof channel !== 'string' && !channel.permissionsFor(msg.guild.me.id).has('SEND_MESSAGES')) {
      return msg.reply(`I don't have a permission for sending messages to that channel. Please change the permission first`);
    }

    if (channel === 'unset') {
      try {
        await guildSettingsSchema.findOneAndUpdate({ guildId: msg.guild.id }, {
          $unset: {
            goodbyeMessage: '',
          }
        });
        return msg.reply(`Successfully reset the welcome message.`);
      } catch (e) {
        return msg.reply(`Can't unset the goodbye message, please try again later`);
      }
    } else if (typeof channel === 'string') {
      return msg.reply(`Please mention a valid channel`);
    }

    let guildSetting;
    try {
      guildSetting = await guildSettingsSchema.findOneAndUpdate({ guildId: msg.guild.id }, {
        goodbyeMessage: {
          channel: channel.id,
          strMsg: goodbyeMsg
        }
      }, { upsert: true, new: true });
      msg.reply(`Successfully set new goodbye message to <#${guildSetting.goodbyeMessage.channel}> `);
    } catch (e) {
      logger.error(e.stack);
      msg.reply(`Can't set goodbye message, pleast try again later`);
    }

  }

};
