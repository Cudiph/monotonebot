const { client } = require('../bot.js');
const { guildSettingsSchema } = require('../library/Database/schema.js');

// user join a guild
client.on('guildMemberAdd', async (member) => {
  const guildSettings = await guildSettingsSchema.findOne({ guildId: member.guild.id })
    .catch(e => logger.error(e));

  if (guildSettings.autoAssignRoleId) {
    member.roles.add(guildSettings.autoAssignRoleId)
      .catch(e => logger.error(e));
  }

  if (guildSettings.welcomeMessage && guildSettings.welcomeMessage.channel) {
    const memberLogChan = member.guild.channels.cache.get(guildSettings.welcomeMessage.channel);
    if (guildSettings.welcomeMessage.strMsg) {
      if (memberLogChan && memberLogChan.permissionsFor(member.guild.me.id).has('SEND_MESSAGES')) {
        const logMsg = guildSettings.welcomeMessage.strMsg
          .replace(/{{@user}}/g, member)
          .replace(/{{user}}/g, `${member.user.username}#${member.user.discriminator}`)
          .replace(/{{guild}}/g, member.guild.name);
        memberLogChan.send(logMsg);

      } else {
        // dm guild owner if client doesn't have perm to send message
        member.guild.owner.send(guildSettings.welcomeMessage.strMsg.replace(/{{user}}/g, member));
      }
    }

  }

});

client.on('guildMemberRemove', async (member) => {
  const guildSettings = await guildSettingsSchema.findOne({ guildId: member.guild.id });

  if (guildSettings.goodbyeMessage && guildSettings.goodbyeMessage.channel) {
    const memberLogChan = member.guild.channels.cache.get(guildSettings.goodbyeMessage.channel);

    if (guildSettings.goodbyeMessage.strMsg) {
      if (memberLogChan && memberLogChan.permissionsFor(member.guild.me.id).has('SEND_MESSAGES')) {
        const logMsg = guildSettings.goodbyeMessage.strMsg
          .replace(/{{@user}}/g, member)
          .replace(/{{user}}/g, `${member.user.username}#${member.user.discriminator}`)
          .replace(/{{guild}}/g, member.guild.name);
        memberLogChan.send(logMsg);

      } else {
        member.guild.owner.send(guildSettings.goodbyeMessage.strMsg.replace(/{{user}}/g,
          `${member.user.username}#${member.user.discriminator}`
        ));

      }
    }

  }

});
