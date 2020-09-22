// importing some required modules / files
const fs = require('fs');
const Discord = require('discord.js');
const creds = require('./data/credentials.json');

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
    console.log(`${file} Modules Loaded`)
  }
}

fs.readdir(`./src/events`, (err, files) => {
  if (err) console.error(err);
  let file = files.filter(file => file.endsWith('.js'));
  file.forEach(file => {
    require(`./events/${file}`);
    console.log(`${file} events loaded`);
  })
});

module.exports = {
  client,
  cooldowns,
  creds,
  Discord,
}