const { client } = require('../bot.js');
const { crud } = require('../library/Database/crud.js');
const { guildSettingsSchema } = require('../library/Database/schema.js');

// event on message
client.on('message', async message => {
  // let now = Date.now(); // performance test
  // fetch prefix from database
  if (message.guild) {
    if (!message.guild.isCached) {
      // fetch data from database
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
          message.guild.isCached = true;
          // make a sign
        } else {
          message.guild.commandPrefix = check.prefix;
          message.guild.volume = check.volume;
        }

        if (check) {
          message.guild.isCached = true;
        }
      } catch (err) {
        logger.log('error', err);
      }
    }
    // console.log(Date.now() - now); // performance test
  }
});
