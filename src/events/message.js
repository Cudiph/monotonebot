const { client } = require('../bot.js');
const { crud } = require('../library/Database/crud.js');
const { guildSettingsSchema } = require('../library/Database/schema.js');

// event on message
client.on('message', async message => {
  // const skrg = Date.now();
  // fetch prefix from database
  if(message.guild) {
    if (!message.guild.isCached) {
      // fetch prefix from database
      await new crud(process.env.MONGO_URL).connect();
      try {
        const check = await guildSettingsSchema.findById(message.guild.id);
        if (!check) {
          // if data from database is null then create default prefix
          const result = await guildSettingsSchema.findOneAndUpdate({
            _id: message.guild.id
          }, {
            _id: message.guild.id,
            prefix: client.commandPrefix,
          },
            {
              upsert: true
            });
          message.guild.commandPrefix = result.prefix;
        } else {
          message.guild.commandPrefix = check.prefix;
        }

      } catch (err) {
        logger.log('error', err);
      }
    } else {
      message.guild.isCached = true;
      // console.log(Date.now() - skrg);
    }
  }
});
