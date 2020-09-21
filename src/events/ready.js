const { client, creds } = require('../bot.js');

// logging to the console if the bot is ready
client.once('ready', () => {
  console.log('Ready!');
});

client.login(creds.Token);