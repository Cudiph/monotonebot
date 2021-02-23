const Command = require('../../structures/Command.js');
const { stripIndents } = require('common-tags');


module.exports = class PurgeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'purge',
      aliases: ['clear'],
      group: 'administration',
      memberName: 'purge',
      description: 'Bulk delete',
      examples: ['purge', 'purge 100'],
      throttling: {
        usages: 2,
        duration: 15,
      },
      args: [
        {
          key: 'total',
          prompt: 'How many message you want to delete?',
          type: 'integer',
          default: 2
        },
        // {
        //   key: 'old',
        //   prompt: 'Auto filter message that older than 2 weeks? (true/false)',
        //   type: 'string',
        //   default: false,
        // }
      ],
      clientPermissions: ['MANAGE_MESSAGES'],
      userPermissions: ['MANAGE_MESSAGES'],
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg, { total }) {
    if (total > 100) {
      total = 100;
    } else if (total <= 0) {
      total = Math.abs(total);
    } else if (total < 2) {
      total = 2;
    }

    try {
      const messages = await msg.channel.messages.fetch({ limit: total });
      msg.channel.bulkDelete(messages).then(deletedMessages => {
        const response = `Bulk deleted **${deletedMessages.size}** messages on <#${msg.channel.id}>`;
        return msg.sendtoLogChan({ strMsg: response });
      }).catch(err => {
        logger.log('error', err);
        msg.say(stripIndents`
        Unable to delete messages
        It's likely because you are trying to delete messages that are under 14 days old.
      `).then(resMsg => resMsg.delete({ timeout: 7000 }));
      });
    } catch (err) {
      logger.log('error', err);
      msg.say(`Unable to delete messages`);
    }

  }

};
