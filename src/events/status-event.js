const { client } = require('../bot.js');
const mongoose = require('mongoose');

// logging to the console if the bot is ready
client.once('ready', () => {
  client.user.setActivity('..help Command', { type: 'PLAYING' });
  // fetch data from database
  mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  });
  logger.log('info', 'Ready!');

});

client.on('error', err => logger.log('error', err));

client.login(process.env.TOKEN);
