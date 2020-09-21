const fetch = require('node-fetch');

module.exports = {
  name: 'cat',
  cooldown: 10,
  description: 'Send a random cat image',
  async execute(message) {
    // get the data
    const response = await fetch('https://aws.random.cat/meow').then(response => response.json());
    message.channel.send(response.file);
  }
}