const axios = require('axios').default;
const Command = require('../../structures/Command.js');

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
    });
  }

  /** @param {import('discord.js-commando').CommandoMessage} msg */
  async run(msg) {
    // get the data
    try {
      const response = await axios.get('https://aws.random.cat/meow');
      msg.say(response.data.file);
    } catch (err) {
      logger.log('error', err);
      msg.say(`Something went wrong, please try again later.\n Error : \`${err}\``)
        .then(theMsg => theMsg.delete({ timeout: 7000 }))
        .catch(e => e);
    }
  }

};
