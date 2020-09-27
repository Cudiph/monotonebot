// importing some required modules / files
const fs = require('fs');
const { CommandoClient } = require('discord.js-commando');
const path = require('path');
require('dotenv').config();
const winston = require('winston');

// global vars
// too lazy to use redis
global.creds = require('./data/credentials.json');
global.prefixCache = {}; // the format is {7123894304: '..' or guild.id : prefix}
global.guildQueue = {} // guildId: [{title, link, uploader, channel, connection}]


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
  owner: '400240052761788427',
  unknownCommandResponse: false,
});

// registerng command group
client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['administration', 'Administration action'],
    ['events', 'interacting with the bot'],
    ['gambling', 'Gambling games'],
    ['games', 'Some minigames'],
    ['search', 'Searching through the internet'],
    ['undefined', 'Testing new commands'],
    ['voice', 'Music or playing audio in voice channel'],
  ])
  .registerDefaultGroups()
  .registerDefaultCommands({
    help: false,
    ping: false,
  })
  .registerCommandsIn(path.join(__dirname, 'Modules'));

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