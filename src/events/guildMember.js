const { client } = require('../bot.js');
const { guildSettingsSchema } = require('../library/Database/schema.js');

// user join a guild
client.on('guildMemberAdd', async (member) => {
  try {
    const guildSettings = await guildSettingsSchema.findOne({ guildId: member.guild.id });
    if (guildSettings.autoAssignRoleId) {
      member.roles.add(guildSettings.autoAssignRoleId);
    }
  } catch (err) {
    logger.error(err.stack);
  }
});
