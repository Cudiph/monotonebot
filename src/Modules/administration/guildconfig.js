const Command = require('../../structures/Command.js');
const { guildSettingsSchema } = require('../../library/Database/schema.js');
const gtrans = require('node-gtrans');


module.exports = class GuildConfigCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'guildconfig',
      group: 'administration',
      memberName: 'guildconfig',
      aliases: ['guildsettings'],
      description: 'Show current guild configuration that stored in the database',
      examples: ['guildconfig'],
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg) {
    let guildSettings;
    try {
      guildSettings = await guildSettingsSchema.findOne({ guildId: msg.guild.id });
      if (!guildSettings) {
        return msg.say(`No configuration found.`);
      }
    } catch (e) {
      return msg.say('Something went wrong, please try again later');
    }

    const embed = {
      color: 0x53bcfc,
      title: `Configuration in ${msg.guild.name}`,
      thumbnail: {
        url: msg.guild.iconURL({ dynamic: true, size: 2048 }),
      },
      fields: [
        {
          name: 'Prefix',
          value: `**${msg.guild.commandPrefix || this.client.commandPrefix}**`,
          inline: true,
        },
        {
          name: 'Language',
          value: gtrans.validateLangId(msg.guild.language),
          inline: true,
        },
        {
          name: 'Log Channel',
          value: guildSettings.logChannelId ? `<#${guildSettings.logChannelId}>` : 'null',
          inline: true,
        },
        {
          name: 'Auto Assign Role',
          value: guildSettings.autoAssignRoleId ? `<@&${guildSettings.autoAssignRoleId}>` : 'null',
          inline: true,
        }
      ]
    };

    const trim = (str, max) => ((str.length > max) ? `${str.slice(0, max - 3)}...` : str);
    if (guildSettings.welcomeMessage && guildSettings.welcomeMessage.channel) {
      embed.fields.push({
        name: 'Welcome Message',
        value: trim(`\`\`\`\n${guildSettings.welcomeMessage.strMsg.replace(/```/g, `'''`)}\`\`\`\nat <#${guildSettings.welcomeMessage.channel}> channel`, 1024)
      });
    }

    if (guildSettings.goodbyeMessage && guildSettings.goodbyeMessage.channel) {
      embed.fields.push({
        name: 'Goodbye Message',
        value: trim(`\`\`\`\n${guildSettings.goodbyeMessage.strMsg.replace(/```/g, `'''`)}\`\`\`\nat <#${guildSettings.goodbyeMessage.channel}> channel`, 1024)
      });
    }

    msg.embed(embed);

  }

};
