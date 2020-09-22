const { crud } = require('../../library/Database/crud.js');
const { serverSettingsSchema } = require('../../library/Database/schema.js');

module.exports = {
  name: 'prefix',
  description: 'set default prefix for the server',
  guildOnly: true,
  args: true,
  async execute(message, args) {
    let url = 'mongodb://localhost:27017/romono'
    if (!args.length) {
      let db = await new crud(url).connect();
      try {
        const result = await serverSettingsSchema.findById(message.guild.id);
        message.channel.send(`This guild current prefix is : "**${result.prefix}**"`)
      } catch (err) {
        console.error(err);
      } finally {
        db.connection.close();
      }
      return;
    }
    if (!message.member.hasPermission("ADMINISTRATOR")) {
      return message.reply(`You do not have permission to do that`);
    }
    let db = await new crud(url).connect();
    try {
      let logger = await serverSettingsSchema.findOneAndUpdate({
        _id: message.guild.id
      }, {
        _id: message.guild.id,
        prefix: args[0]
      },
        {
          upsert: true
        });
        console.log(logger);
    } catch (err) {
      console.error(err);
    } finally {
      db.connection.close();
    }

  }
}