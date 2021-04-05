const { client } = require('../bot.js');
const { guildSettingsSchema, userDataSchema } = require('../util/schema.js');

// event on message
client.on('message', async msg => {
  // let now = Date.now(); // performance test
  // fetch prefix from database
  if (msg.guild) {
    const guildID = msg.guild.id;
    if (!msg.guild.isCached) {
      try {
        const data = await guildSettingsSchema.findOne({ guildId: guildID });
        if (!data) {
          await guildSettingsSchema.findOneAndUpdate({ guildId: guildID }, {
            guildId: guildID,
            guildName: msg.guild.name,
            prefix: client.commandPrefix,
            volume: 1,
          }, { upsert: true });
          msg.guild.isCached = true;
          // make a sign
        } else {
          msg.guild.commandPrefix = data.prefix;
          msg.guild.volume = data.volume;
          msg.guild.language = data.language;
        }

        if (data) {
          msg.guild.isCached = true;
        }
      } catch (err) {
        logger.error(err.stack);
      }
    }

    if (msg.isCommand) {
      updateUser(msg);
    }

    // console.log(Date.now() - now); // performance test
  }
});

/**
 * Function to update user data
 * @param {CommandoMessage} msg - Commando Message
 * @async
 * @returns {void}
 */
async function updateUser(msg) {
  try {
    await userDataSchema.findOneAndUpdate({ userId: msg.author.id }, {
      $inc: { exp: 1, money: msg.content.length * 5 },
    }, { upsert: true, setDefaultsOnInsert: true, new: true });
  } catch (e) {
    return e;
  }
}
