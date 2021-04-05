const { stripIndents } = require('common-tags');
const Command = require('../../structures/Command.js');
const { guildSettingsSchema } = require('../../util/schema.js');

module.exports = class LogChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'logchannel',
      group: 'administration',
      memberName: 'logchannel',
      aliases: ['setlogchannel', 'logchan'],
      description: 'Set log channel where all the log is sent',
      details: stripIndents`
        Use no argument to show current log channel,
        type unset after command to reset the configuration.
        List of commands that triggered messages to be sent to the log channel:
        ['autorole', 'ban', 'kick', 'prefix', 'purge', 'unban']
      `,
      examples: ['logchannel #log', 'logchannel', 'logchannel unset'],
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          key: 'channel',
          prompt: 'Which channel will be the log channel?',
          type: 'text-channel|string',
          default: '',
        },
      ],
      throttling: {
        usages: 2,
        duration: 30,
      }
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg, { channel }) {
    // fetch data
    let guildSettings;
    try {
      guildSettings = await guildSettingsSchema.findOne({ guildID: msg.guild.id });
    } catch (err) {
      logger.error(err.stack);
      return msg.reply(`Can't load the data, please assign a new one if it's not already set`);
    }
    // show current log channel if no argument
    if (typeof channel !== 'object') {
      if (channel.toLowerCase() === 'unset') {
        try {
          await guildSettingsSchema.findOneAndUpdate({ guildID: msg.guild.id }, {
            $unset: { logChannelId: '' },
          });
          return msg.reply(`Logchannel is unsetted successfully.`);
        } catch (e) {
          return msg.reply(`Can't remove log channel, please try again.`);
        }

      }
      if (guildSettings?.logChannelId) {
        return msg.reply(`Current log channel is <#${guildSettings.logChannelId}>`);
      } else {
        return msg.reply(`Log channel is not yet assigned, use \`${msg.guild.commandPrefix}logchannel <channelName>\` to set a new one`);
      }
    }
    if (!channel.permissionsFor(msg.guild.me.id).has('SEND_MESSAGES')) {
      return msg.reply(`I don't have a permission for sending messages to that channel. Please change the permission first`);
    }
    // set a new one
    try {
      const newGuildSettings = await guildSettingsSchema.findOneAndUpdate({ guildID: msg.guild.id }, {
        logChannelId: channel.id,
      }, { new: true, upsert: true });
      return msg.reply(`Assignment successful, new log channel is <#${newGuildSettings.logChannelId}>`);
    } catch (err) {
      logger.error(err.stack);
      return msg.reply(`Can't update new log channel.`);
    }
  }

};
