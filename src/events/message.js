const { client } = require('../bot.js');
const { guildSettingsSchema, userDataSchema } = require('../util/schema.js');

// event on message
client.on('message', async msg => {
  // let now = Date.now(); // performance test
  // fetch prefix from database
  if (msg.guild) {
    const guildId = msg.guild.id;
    if (!msg.guild.isCached) {
      try {
        const check = await guildSettingsSchema.findOne({ guildId: guildId });
        if (!check) {
          await guildSettingsSchema.findOneAndUpdate({ guildId: guildId }, {
            guildId: guildId,
            guildName: msg.guild.name,
            prefix: client.commandPrefix,
            volume: 1,
          }, { upsert: true });
          msg.guild.commandPrefix = client.commandPrefix;
          msg.guild.volume = 1;
          msg.guild.isCached = true;
          // make a sign
        } else {
          msg.guild.commandPrefix = check.prefix;
          msg.guild.volume = check.volume;
          msg.guild.language = check.language;
        }

        if (check) {
          msg.guild.isCached = true;
        }
      } catch (err) {
        logger.log('error', err.stack);
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
