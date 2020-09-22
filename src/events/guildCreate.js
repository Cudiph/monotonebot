const mongoose = require('mongoose');
const { client, cache } = require('../bot.js');
const { crud } = require('../library/Database/crud.js');
const { serverSettingsSchema } = require('../library/Database/schema.js');

// event on message
client.on('guildCreate', async guild => {
  let guildData = cache.guildSettings[guild.id];
  console.log(guildData);

  if (guildData) {
    console.log('pass');
    return;
  }

  let db = await new crud('mongodb://localhost:27017/romono').connect();
  try {
    await serverSettingsSchema.findOneAndUpdate({
      _id: guild.id
    },{
      _id: guild.id,
      prefix: '..'
    },
    {
      upsert: true
    });
  } catch (err) {
    console.error(err);
  } finally {
    db.connection.close();
  }

});