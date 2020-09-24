const Discord = require('discord.js')
const { client, cooldowns } = require('../bot.js');
const { crud } = require('../library/Database/crud.js');
const { guildSettingsSchema } = require('../library/Database/schema.js');

const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// event on message
client.on('message', async message => {
  let prefix;

  if (!prefixCache[message.guild.id]) {
    // fetch prefix from database
    // closing the connection make an error when calling prefix command
    // idk why but it'll boost performance
    await new crud('mongodb://localhost:27017/romono').connect();
    try {
      const check = await guildSettingsSchema.findById(message.guild.id);
      if (!check) {
        // if data from database is null then create default prefix
        // it'll be used when the bot is invited and the bot is offline
        // then console will show error but that's normal
        const result = await guildSettingsSchema.findOneAndUpdate({
          _id: message.guild.id
        }, {
          _id: message.guild.id,
          prefix: '..',
        },
          {
            upsert: true
          });
        prefix = prefixCache[message.guild.id] = result.prefix;
      } else {
        prefix = prefixCache[message.guild.id] = check.prefix;
      }

    } catch (err) {
      logger.log('error', err)
    }
  } else {
    prefix = prefixCache[message.guild.id];
  }

  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);

  // if message is start with not the prefix and not the mention then return
  if (!message.content.startsWith(prefix) && !prefixRegex.test(message.content)) {
    logger.log('info', `${message.author.username}#${message.author.discriminator} | ${message.content}`);
    return;
  }

  // if client mentioned then set prefix to client id or mention
  if (prefixRegex.test(message.content)) [, prefix] = message.content.match(prefixRegex);;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // check whenever command is exist
  command = client.commands.get(commandName) ||
    client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
  if (!command) return;

  // cooldown script
  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  // cooldown variable
  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`)
          .then(msg => {
            // delete both author and bot message if there was any error
            msg.delete({
              timeout: (timeLeft * 1000) + 2000
            });
          });
      }
    }
  }
  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  // trying if command is work properly if not then reply with error message
  try {
    command.execute(message, args);
  } catch (error) {
    logger.log('error', error);
    message.reply('there was an error trying to execute that command!')
      .then(async msg => {
        // delete both author and bot message if there was any error
        await msg.delete({
          timeout: 7000
        });
        message.delete();
      });
  }
});
