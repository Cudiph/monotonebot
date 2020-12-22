const { Command } = require('discord.js-commando');
const { guildSettingsSchema } = require('../../library/Database/schema.js');

module.exports = class LogChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'logchannel',
      group: 'administration',
      memberName: 'logchannel',
      aliases: ['setlogchannel'],
      description: 'Set log channel where all the log is sent',
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
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg, { channel }) {
    // fetch data
    let guildSettings;
    try {
      guildSettings = await guildSettingsSchema.findOne({ guildId: msg.guild.id });
    } catch (err) {
      logger.log('error', err.stack);
      return msg.channel.send(`Can't load the playlist`);
    }
    // show current log channel if no argument
    if (typeof channel !== 'object') {
      if (channel.toLowerCase() === 'unset') {
        await guildSettingsSchema.findOneAndUpdate({ guildId: msg.guild.id }, {
          $unset: { logChannelId: '' },
        });
        return msg.reply(`Logchannel is unsetted successfully.`);
      }
      if (guildSettings && guildSettings.logChannelId) {
        return msg.reply(`Current log channel is <#${guildSettings.logChannelId}>`)
      } else {
        return msg.reply(`Log channel is not yet assigned, use \`${msg.guild.commandPrefix}logchannel <channelName>\` to set a new one`);
      }
    }
    if (!channel.permissionsFor(msg.guild.me.id).has('SEND_MESSAGES')) {
      return msg.reply(`I don't have a permission for sending messages to that channel`);
    }
    // set a new one
    try {
      const newGuildSettings = await guildSettingsSchema.findOneAndUpdate({ guildId: msg.guild.id }, {
        logChannelId: channel.id,
      }, { new: true, upsert: true });
      return msg.say(`Assignment successful, new log channel is <#${newGuildSettings.logChannelId}>`)
    } catch (err) {
      logger.log('error', err.stack);
      return msg.channel.send(`Can't update new log channel.`);
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
