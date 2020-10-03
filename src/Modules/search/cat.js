const fetch = require('node-fetch');
const { Command } = require('discord.js-commando');

module.exports = class CatCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'cat',
      group: 'search',
      aliases: ['meow'],
      memberName: 'cat',
      description: 'Send a random cat image',
      examples: ['cat'],
      throttling: {
        usages: 5,
        duration: 10,
      },
    })
  }

  async run(msg) {
    // get the data
    const response = await fetch('https://aws.random.cat/meow').then(response => response.json());
    msg.channel.send(response.file);
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
