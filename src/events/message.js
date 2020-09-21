const { client, creds, cooldowns, Discord } = require('../bot.js');

// event on message
client.on('message', message => {
  if (!message.content.startsWith(creds.Prefix)) {
    console.log(`${message.author.username}#${message.author.discriminator} | ${message.content}`);
    return;
  }

  const args = message.content.slice(creds.Prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // check whenever command is exist
  command = client.commands.get(commandName) ||
    client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
  if (!command) return;

  // cooldown script
  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

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
    console.error(error);
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