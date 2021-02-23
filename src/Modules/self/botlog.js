const Command = require('../../structures/Command.js');
const fs = require('fs');

module.exports = class BotLogCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'botlog',
      group: 'self',
      memberName: 'botlog',
      description: 'Get or clear bot\'s log file',
      examples: ['botlog', 'botlog clear'],
      guarded: true,
      ownerOnly: true,
      args: [
        {
          key: 'type',
          prompt: 'What do you want to do with the log file?',
          type: 'string',
          default: 'get',
          oneOf: ['get', 'clear'],
        }
      ]
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg, { type }) {
    if (type == 'clear') {
      try {
        fs.truncateSync(`${__dirname}/../../data/logs`);
      } catch (e) {
        return msg.say(`The logs file may not have been created\nError: \`${e.message}\``);
      }
      msg.say('Cleared successfully');
    } else {
      msg.say({
        files: [{
          attachment: `${__dirname}/../../data/logs`,
          name: 'logs.txt'
        }]
      }).catch(e => msg.say(`The logs file may not have been created\nError: \`${e.message}\``));
    }

  }

};
