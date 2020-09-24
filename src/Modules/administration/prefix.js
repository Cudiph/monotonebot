const Discord = require('discord.js');
const { crud } = require('../../library/Database/crud.js');
const { guildSettingsSchema } = require('../../library/Database/schema.js');

module.exports = {
  name: 'prefix',
  description: 'set default prefix for the server',
  guildOnly: true,
  args: true,
  async execute(message, args) {
    // define old prefix and mongo url
    let oldPrefix = '';
    let url = 'mongodb://localhost:27017/romono'
    if (!args.length) {
      // if no arg defines then send current guild prefix
      let db = await new crud(url).connect();
      try {
        const result = await guildSettingsSchema.findById(message.guild.id);
        message.channel.send(`This guild current prefix is : "**${result.prefix}**"`)
      } catch (err) {
        logger.log('error', err);
      } finally {
        db.connection.close();
      }
      return;
    }
    if (!message.member.hasPermission("ADMINISTRATOR")) {
      return message.reply(`You do not have permission to do that`);
    }
    // set new prefix for guild
    let db = await new crud(url).connect();
    try {
      let result = await guildSettingsSchema.findOneAndUpdate({
        _id: message.guild.id
      }, {
        _id: message.guild.id,
        prefix: args[0]
      },
        {
          upsert: true
        });
      oldPrefix = result.prefix;
    } catch (err) {
      logger.log('error', err);
      return message.channel.send(`Can't update the prefix.`);
    } finally {
      db.connection.close();
    }
    // define new variable in cache
    prefixCache[message.guild.id] = args[0];

    const embed = new Discord.MessageEmbed()
      .setColor('#ff548e')
      .setDescription(`This guild prefix has been updated`)
      .addField('From', `**${oldPrefix}**`, true)
      .addField('To', `**${args[0]}**`, true);
    // send embed
    message.channel.send(embed);
  }
}
