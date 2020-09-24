const { client } = require('../bot.js');
const { crud } = require('../library/Database/crud.js');
const { guildSettingsSchema } = require('../library/Database/schema.js');

// event on message
client.on('guildCreate', async guild => {
   let db = await new crud('mongodb://localhost:27017/romono').connect();
  try {
    await guildSettingsSchema.findOneAndUpdate({
      _id: guild.id
    },{
      _id: guild.id,
      prefix: '..'
    },
    {
      upsert: true
    });
  } catch (err) {
    logger.log('error', err);
  } finally {
    db.connection.close();
  }

});