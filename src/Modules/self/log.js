const Command = require('../../structures/Command.js');
const fs = require('fs');

module.exports = class BotLogCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'log',
      group: 'self',
      memberName: 'log',
      description: 'Get or clear log file',
      examples: ['log get lavalink', 'log clear bot'],
      guarded: true,
      ownerOnly: true,
      args: [
        {
          key: 'method',
          prompt: 'What do you want to do with the log file?',
          type: 'string',
          default: 'get',
          oneOf: ['get', 'clear'],
        },
        {
          key: 'type',
          prompt: 'What do you want to do with the log file?',
          type: 'string',
          default: 'bot',
          oneOf: ['lavalink', 'bot'],
        }
      ]
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg, { method, type }) {
    if (method === 'clear') {
      try {
        if (type === 'bot') fs.truncateSync(`${__dirname}/../../data/logs`);
        else fs.truncateSync(`${__dirname}/../../data/spring.log`);
      } catch (e) {
        return msg.say(`The logs file may not have been created\nError: \`${e.message}\``);
      }
      return msg.say('Cleared successfully');
    }
    if (type === 'bot') {
      msg.say({
        files: [{
          attachment: `${__dirname}/../../data/logs`,
          name: 'bot.log'
        }]
      }).catch(e => msg.say(`The logs file may not have been created\nError: \`${e.message}\``));
    } else {
      msg.say({
        files: [{
          attachment: `${__dirname}/../../data/spring.log`,
          name: 'lavalink.log'
        }]
      }).catch(e => msg.say(`The logs file may not have been created\nError: \`${e.message}\``));
    }

  }

};
