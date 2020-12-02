// importing some required modules / files
const fs = require('fs');
const { CommandoClient } = require('discord.js-commando');
const path = require('path');
const winston = require('winston');

// winston logger
global.logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: './src/data/logs' }),
  ],
  format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
});

// declaring some discord.js function
const client = new CommandoClient({
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

// including events folder
fs.readdir(`./src/events`, (err, files) => {
  if (err) logger.error('error', err);
  let file = files.filter(file => file.endsWith('.js'));
  file.forEach(file => {
    require(`./events/${file}`);
    logger.log('info', `${file} events loaded`);
  })
});

module.exports = {
  client,
}