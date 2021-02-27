const { client } = require('../bot.js');
const { guildSettingsSchema } = require('../util/schema.js');

// event on message
client.on('guildCreate', async guild => {
  try {
    await guildSettingsSchema.findOneAndUpdate({ guildId: guild.id }, {
      guildId: guild.id,
      guildName: guild.name,
      prefix: client.commandPrefix,
      volume: 1,
    }, { upsert: true });
  } catch (err) {
    logger.log('error', err.stack);
  }
});

client.on('guildDelete', async guild => {
  try {
    guildSettingsSchema.findOneAndDelete({ guildId: guild.id });
  } catch (err) {
    logger.log('error', err.stack);
  }
});
