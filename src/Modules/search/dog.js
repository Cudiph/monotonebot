const fetch = require('node-fetch');
const { Command } = require('discord.js-commando');

module.exports = class DogCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'dog',
      group: 'search',
      memberName: 'dog',
      description: 'Send a random dog image',
      examples: ['dog'],
      throttling: {
        usages: 5,
        duration: 10,
      },
    })
  }

  async run(msg) {
    // get the data
    const response = await fetch('https://dog.ceo/api/breeds/image/random').then(response => response.json());
    msg.channel.send(response.message);
  }

  async onBlock(msg, reason, data) {
    let parent = await super.onBlock(msg, reason, data);
    parent.delete({ timeout: 9000 })
  }

  onError(err, message, args, fromPattern, result) {
    super.onError(err, message, args, fromPattern, result)
      .then(msgParent => msgParent.delete({ timeout: 9000 }));
  }
}
