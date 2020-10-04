const { client } = require('../bot.js');
const { crud } = require('../library/Database/crud.js');
const { guildSettingsSchema } = require('../library/Database/schema.js');

// event on message
client.on('message', async message => {
  // fetch prefix from database
  if (message.guild) {
    if (!message.guild.isCached) {
      // fetch prefix from database
      let db = await new crud(process.env.MONGO_URL);
      db.connect();
      try {
        const check = await db.findById(guildSettingsSchema, message.guild.id);
        if (!check) {
          await db.writeOneUpdate(guildSettingsSchema, message.guild.id, {
            _id: message.guild.id,
            prefix: client.commandPrefix,
            volume: 1
          });
          message.guild.commandPrefix = client.commandPrefix;
          message.guild.volume = 1;
        } else {
          message.guild.commandPrefix = check.prefix;
          message.guild.volume = check.volume;
        }
      } catch (err) {
        logger.log('error', err);
      }
    }
    message.guild.isCached = true;
  }
});
