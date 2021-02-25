const { stripIndents } = require('common-tags');
const Command = require('../../structures/Command.js');
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
        \`{{user}}\` to show the user tag without mentioning
        \`{{guild}}\` will display guild name
        \`{{members}}\` will display guild member count
        Put the variable in the greeting arg.
        To reset this configuration, you can type "unset" after command like in
        the examples below.
      `,
      examples: [
        'setwelcome #arrival "Welcome to the {{guild}} {{@user}}! We now have {{members}} members!"',
        'setwelcome unset'
      ],
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
      throttling: {
        usages: 2,
        duration: 300,
      }
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

};
