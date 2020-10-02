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
          let result = db.writeOneUpdate(guildSettingsSchema, { _id: message.guild.id }, {
            _id: message.guild.id,
            prefix: client.commandPrefix,
          });
          message.guild.commandPrefix = result.prefix;
        } else {
          message.guild.commandPrefix = check.prefix;
        }
      } catch (err) {
        logger.log('error', err);
      }
    }
    message.guild.isCached = true;
  }
});
