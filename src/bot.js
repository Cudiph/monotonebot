// importing some required modules / files
const fs = require('fs');
const path = require('path');
const winston = require('winston');
const MonoClient = require('./structures/Client');

// winston logger
global.logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: `${__dirname}/data/logs` }),
  ],
  format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
  exitOnError: false,
});

// declaring some discord.js function
const client = new MonoClient({
  commandPrefix: '..',
  owner: '400240052761788427',
  unknownCommandResponse: false,
});
// registerng command group
client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['administration', 'Administration'],
    ['anime', 'Anime'],
    ['gambling', 'Gambling'],
    ['games', 'Minigames'],
    ['search', 'Search'],
    ['self', 'Self configuration'],
    ['undefined', 'undefined'],
    ['util', 'Utility'],
    ['voice', 'Voice'],
  ])
  .registerDefaultGroups()
  .registerDefaultCommands({
    prefix: false,
    help: false,
    ping: false,
    unknownCommand: false,
  })
  .registerCommandsIn(path.join(__dirname, 'Modules'));

// run events folder
fs.readdir(`${__dirname}/events`, (err, files) => {
  if (err) logger.error(err);
  const jsFiles = files.filter(file => file.endsWith('.js'));
  jsFiles.forEach(file => {
    require(`${__dirname}/events/${file}`);
    logger.log('info', `${file} events loaded`);
  });
});

module.exports = {
  client,
};
