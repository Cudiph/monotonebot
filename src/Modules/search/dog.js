const axios = require('axios').default;
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
    });
  }

  /** @param {import('discord.js-commando').CommandoMessage} message */
  async run(msg) {
    // get the data
    try {
      const response = await axios.get('https://dog.ceo/api/breeds/image/random');
      msg.say(response.data.message);
    } catch (err) {
      logger.log('error', err);
      msg.say(`Something went wrong, please try again later.\n Error : \`${err}\``)
        .then(theMsg => theMsg.delete({ timeout: 7000 }))
        .catch(e => e);
    }
    const response = await axios.get('https://dog.ceo/api/breeds/image/random');
    msg.say(response.message);
  }

  async onBlock(msg, reason, data) {
    super.onBlock(msg, reason, data)
      .then(blockMsg => blockMsg.delete({ timeout: 10000 }))
      .catch(e => e); // do nothing
  }

  onError(err, message, args, fromPattern, result) {
    super.onError(err, message, args, fromPattern, result)
      .then(msgParent => msgParent.delete({ timeout: 10000 }))
      .catch(e => e); // do nothing
  }
};
