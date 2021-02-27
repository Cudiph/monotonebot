const Command = require('../../structures/Command.js');
const { guildSettingsSchema } = require('../../util/schema.js');


module.exports = class AutoRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'autorole',
      group: 'administration',
      memberName: 'autorole',
      description: 'give the specified role to someone who joined the guild',
      details: `To reset this configuration you can use \`aar unset\``,
      aliases: ['autoassignrole', 'aar'],
      examples: ['aar @guild-role', 'aar unset'],
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
      return msg.sendToLogChan({ strMsg: `Assignment successful, new auto role is <@&${newGuildSettings.autoAssignRoleId}>` });
    } catch (err) {
      logger.log('error', err.stack);
      return msg.reply(`Can't update new log channel.`);
    }
  }

};
