const { stripIndents } = require('common-tags');
const { Command } = require('discord.js-commando');
const { guildSettingsSchema } = require('../../library/Database/schema.js');


module.exports = class WelcomeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'setwelcome',
      group: 'administration',
      memberName: 'setwelcome',
      description: 'Set a welcome message to your new member',
      details: stripIndents`
        Custom variable are:
        \`{{@user}}\` to mention the user
        \`{{user}}\` to show user "username#discriminator" without mentioning
        \`{{guild}}\` will display guild name
        Put the variable in the greeting arg
      `,
      examples: ['setwelcome #arrival "Welcome to the {{guild}} {{@user}}!"'],
      guildOnly: true,
      clientPermissions: ['SEND_MESSAGES'],
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          key: 'channel',
          prompt: 'Which channel will the greeting message be sent?',
          type: 'text-channel|string',
        },
        {
          key: 'greeting',
          prompt: 'What message do you want to send to the new member?',
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
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg, { channel, greeting }) {
    if (typeof channel !== 'string' && !channel.permissionsFor(msg.guild.me.id).has('SEND_MESSAGES')) {
      return msg.reply(`I don't have a permission for sending messages to that channel. Please change the permission first`);
    }

    if (channel === 'unset') {
      try {
        await guildSettingsSchema.findOneAndUpdate({ guildId: msg.guild.id }, {
          $unset: {
            welcomeMessage: '',
          }
        });
        return msg.reply(`Successfully reset the welcome message.`);
      } catch (e) {
        return msg.reply(`Can't unset the welcome message, please try again later`);
      }
    } else if (typeof channel === 'string') {
      return msg.reply(`Please mention a valid channel`);
    }

    let guildSetting;
    try {
      guildSetting = await guildSettingsSchema.findOneAndUpdate({ guildId: msg.guild.id }, {
        welcomeMessage: {
          channel: channel.id,
          strMsg: greeting
        }
      }, { upsert: true, new: true });
      msg.reply(`Successfully set new welcome message to <#${guildSetting.welcomeMessage.channel}> `);
    } catch (e) {
      logger.error(e.stack);
      msg.reply(`Can't set welcome message, pleast try again later`);
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

