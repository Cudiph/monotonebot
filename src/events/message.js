const { client } = require('../bot.js');
const { guildSettingsSchema } = require('../library/Database/schema.js');

// event on message
client.on('message', async msg => {
  // let now = Date.now(); // performance test
  // fetch prefix from database
  const guildId = msg.guild.id;
  if (msg.guild) {
    if (!msg.guild.isCached) {
      try {
        const check = await guildSettingsSchema.findOne({ guildId: guildId });
        if (!check) {
          await guildSettingsSchema.findOneAndUpdate({ guildId: guildId }, {
            guildId: guildId,
            guildName: msg.guild.name,
            prefix: client.commandPrefix,
            volume: 1
          }, { upsert: true });
          msg.guild.commandPrefix = client.commandPrefix;
          msg.guild.volume = 1;
          msg.guild.isCached = true;
          // make a sign
        } else {
          msg.guild.commandPrefix = check.prefix;
          msg.guild.volume = check.volume;
        }

        if (check) {
          msg.guild.isCached = true;
        }
      } catch (err) {
        logger.log('error', err.stack);
      }
    }
    // console.log(Date.now() - now); // performance test
  }
});
