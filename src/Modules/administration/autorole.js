const { Command } = require('discord.js-commando');
const { guildSettingsSchema } = require('../../library/Database/schema.js');
const { sendtoLogChan } = require('../../library/helper/embed.js');

module.exports = class AutoRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'autorole',
      group: 'administration',
      memberName: 'autorole',
      description: 'give the specified role to someone who joined the guild',
      aliases: ['autoassignrole', 'aar'],
      examples: ['aar @guild-role'],
      guildOnly: true,
      clientPermissions: ['MANAGE_ROLES'],
      userPermissions: ['MANAGE_ROLES'],
      args: [
        {
          key: 'role',
          prompt: 'Which role to be auto assigned to new member?',
          type: 'role|string',
          default: '',
        }
      ],
      throttling: {
        usages: 2,
        duration: 120,
      }
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg, { role }) {
    // fetch data
    let guildSetting;
    try {
      guildSetting = await guildSettingsSchema.findOne({ guildId: msg.guild.id });
    } catch (err) {
      logger.log('error', err.stack);
      return msg.reply(`Can't load the data, please assign a new one if it's not already set`);
    }

    // show current auto role if no argument
    if (typeof role !== 'object') {
      if (role.toLowerCase() === 'unset') {
        try {
          await guildSettingsSchema.findOneAndUpdate({ guildId: msg.guild.id }, {
            $unset: { autoAssignRoleId: '' },
          });
          return msg.reply(`Auto assign role is removed successfully.`);
        } catch (e) {
          return msg.reply(`Can't remove the auto role, please try again.`);
        }

      }
      if (guildSetting && guildSetting.autoAssignRoleId) {
        return msg.reply(`Current auto role is <@&${guildSetting.autoAssignRoleId}>`);
      } else {
        return msg.reply(`Auto role is not yet assigned, use \`${msg.guild.commandPrefix}aar <mentionRole>\` to set a new one`);
      }
    }

    if (role.managed) {
      return msg.reply(`${role} is managed by an external service, please choose another one.`);
    } else if (role.name === '@everyone') {
      return msg.reply(`Can't assign to at everyone role, please choose another one.`);
    }

    if (role.comparePositionTo(msg.guild.me.roles.cache.find(botRole => botRole.managed)) > 0) {
      return msg.say(`**${role.name}** role is higher position than my built-in role. Please change the position first in the server settings.`);
    }

    // set a new one
    try {
      const newGuildSettings = await guildSettingsSchema.findOneAndUpdate({ guildId: msg.guild.id }, {
        autoAssignRoleId: role.id,
      }, { new: true, upsert: true });
      return sendtoLogChan(msg, { strMsg: `Assignment successful, new auto role is <@&${newGuildSettings.autoAssignRoleId}>` });
    } catch (err) {
      logger.log('error', err.stack);
      return msg.reply(`Can't update new log channel.`);
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

