const fetch = require('node-fetch');

module.exports = {
  name: 'dog',
  cooldown: 10,
  description: 'Send a random dog image',
  async execute(message) {
    // get the data
    const response = await fetch('https://dog.ceo/api/breeds/image/random').then(response => response.json());
    message.channel.send(response.message);

  }
}