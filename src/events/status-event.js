const { client } = require('../bot.js');
const mongoose = require('mongoose');
const { version } = require('../../package.json');

// logging to the console if the bot is ready
client.once('ready', () => {
  client.user.setActivity(
    `@Monotone help | v${version}`,
    { type: 'PLAYING' }
  );
  // fetch data from database
  mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  });
  logger.info('Ready!');

});

client.on('error', err => logger.error(err.stack));

client.login(process.env.TOKEN);
