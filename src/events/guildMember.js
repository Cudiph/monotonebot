const { client } = require('../bot.js');
const { guildSettingsSchema } = require('../library/Database/schema.js');

// user join a guild
client.on('guildMemberAdd', async (member) => {
  const guildSetting = await guildSettingsSchema.findOne({ guildId: member.guild.id })
    .catch(e => logger.error(e));

  if (guildSetting) {
    if (guildSetting.autoAssignRoleId) {
      member.roles.add(guildSetting.autoAssignRoleId)
        .catch(e => logger.error(e));
    }

    if (guildSetting.welcomeMessage && guildSetting.welcomeMessage.channel) {
      const memberLogChan = member.guild.channels.cache.get(guildSetting.welcomeMessage.channel);
      if (guildSetting.welcomeMessage.strMsg) {
        if (memberLogChan && memberLogChan.permissionsFor(member.guild.me.id).has('SEND_MESSAGES')) {
          const logMsg = guildSetting.welcomeMessage.strMsg
            .replace(/{{@user}}/g, member)
            .replace(/{{user}}/g, `${member.user.username}#${member.user.discriminator}`)
            .replace(/{{guild}}/g, member.guild.name)
            .replace(/{{members}}/g, member.guild.memberCount);
          memberLogChan.send(logMsg);

        } else {
          // dm guild owner if client doesn't have perm to send message
          member.guild.owner.send(guildSetting.welcomeMessage.strMsg.replace(/{{user}}/g, member));
        }
      }

    }

  }


});

client.on('guildMemberRemove', async (member) => {
  const guildSetting = await guildSettingsSchema.findOne({ guildId: member.guild.id });

  if (guildSetting && guildSetting.goodbyeMessage && guildSetting.goodbyeMessage.channel) {
    const memberLogChan = member.guild.channels.cache.get(guildSetting.goodbyeMessage.channel);

    if (guildSetting.goodbyeMessage.strMsg) {
      if (memberLogChan && memberLogChan.permissionsFor(member.guild.me.id).has('SEND_MESSAGES')) {
        const logMsg = guildSetting.goodbyeMessage.strMsg
          .replace(/{{@user}}/g, member)
          .replace(/{{user}}/g, `${member.user.username}#${member.user.discriminator}`)
          .replace(/{{guild}}/g, member.guild.name)
          .replace(/{{members}}/g, member.guild.memberCount);
        memberLogChan.send(logMsg);

      } else {
        member.guild.owner.send(guildSetting.goodbyeMessage.strMsg.replace(/{{user}}/g,
          `${member.user.username}#${member.user.discriminator}`
        ));

      }
    }

  }

});
