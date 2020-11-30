const axios = require('axios').default;
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
    try {
      const response = await axios.get('https://aws.random.cat/meow');
      msg.channel.send(response.data.file);
    } catch (err) {
      logger.log('error', err);
      msg.say(`Something went wrong, please try again later.\n Error : \`${err}\``)
        .then(theMsg => theMsg.delete({ timeout: 7000 }));
    }
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
