const { Command } = require('discord.js-commando');
const { emoji } = require('../../library/helper/discord-item.js');
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

  async run(msg, { total }) {
    if (total > 100) {
      total = 100;
    } else if (total <= 0) {
      total = Math.abs(total);
    } else if (total < 2) {
      total = 2;
    }

    try {
      let messages = await msg.channel.messages.fetch({ limit: total })
      msg.channel.bulkDelete(messages).then(messages => {
        msg.channel.send(`Bulk deleted ${messages.size} messages`);
      }).catch(err => {
        logger.log('error', err);
        msg.channel.send(stripIndents`
        Unable to delete messages
        It's likely because you are trying to delete messages that are under 14 days old.
      `).then(msg => msg.delete({ timeout: 7000 }));
      });
    } catch (err) {
      logger.log('error', err);
      msg.channel.send(`Unable to delete messages`)
    }

  }

  onBlock(msg, reason, data) {
    super.onBlock(msg, reason, data).then(parent => parent.delete({ timeout: 9000 }));
  }
};