// importing some required modules / files
const fs = require('fs');
const Discord = require('discord.js');
require('dotenv').config();
const winston = require('winston');

// global vars
// too lazy to use redis
global.creds = require('./data/credentials.json');
global.prefixCache = {}; // the format is {7123894304: '..' or guild.id : prefix}
global.guildQueue = {} // guildId: [{title, link, uploader}]


// winston logger
global.logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: './src/data/logs' }),
  ],
  format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
});

// declaring some discord.js function
const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

// importing command modules
const modsFolder = fs.readdirSync(`./src/Modules`);
// Iterating to each folder to get all the command modules
for (const subfolder of modsFolder) {
  files = fs.readdirSync(`${__dirname}/Modules/${subfolder}`).filter(file => file.endsWith('js'));
  for (const file of files) {
    const command = require(`${__dirname}/Modules/${subfolder}/${file}`);
    client.commands.set(command.name, command);
    logger.log('info', `${file} Modules Loaded`)
  }
}

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
  cooldowns,
}