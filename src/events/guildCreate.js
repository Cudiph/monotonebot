const { client } = require('../bot.js');
const { crud } = require('../library/Database/crud.js');
const { guildSettingsSchema } = require('../library/Database/schema.js');

// event on message
client.on('guildCreate', async guild => {
  let db = await new crud(process.env.MONGO_URL);
  db.connect();
  try {
    await db.writeOneUpdate(guildSettingsSchema, guild.id, {
      _id: guild.id,
      prefix: '..',
      volume: 1,
    });
  } catch (err) {
    logger.log('error', err);
  } finally {
    db.close();
  }
});

client.on('guildDelete', async guild => {
  let db = await new crud(process.env.MONGO_URL);
  db.connect();
  try {
    await db.findByIdDelete(guildSettingsSchema, guild.id);
  } catch (err) {
    logger.log(err);
  } finally {
    db.close();
  }
})
