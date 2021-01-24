const { Command } = require('discord.js-commando');
const { setEmbedQueueCmd } = require('../../library/helper/embed.js');
const { emoji } = require('../../library/helper/discord-item.js');

module.exports = class QueueCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'queue',
      group: 'voice',
      aliases: ['q'],
      memberName: 'queue',
      description: 'Show queue',
      examples: ['queue 4', 'q 3 14'],
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 10,
      },
      args: [
        {
          key: 'toPage',
          prompt: 'Which page to show?',
          type: 'integer',
          default: 1,
          min: 1,
        },
        {
          key: 'itemsPerPage',
          prompt: 'How many track per page do you want to show?',
          type: 'integer',
          default: 9,
          min: 2,
          max: 18,
        }
      ]
    });
  }

  /** @param {import('discord.js-commando').CommandoMessage} message */
  async run(msg, { toPage, itemsPerPage }) {
    if (!msg.guild.queue) {
      return msg.say(`There is no queue.`);
    }

    // navigation vars
    const queue = msg.guild.queue;
    let page = toPage - 1;
    // let itemsPerPage = 9;
    let index = page * itemsPerPage;

    if (page + 1 >= Math.ceil(queue.length / itemsPerPage)) {
      page = Math.ceil(queue.length / itemsPerPage) - 1;
      index = page * itemsPerPage;
    }

    // send embed
    msg.say({ embed: setEmbedQueueCmd(queue, index, page, msg, itemsPerPage) })
      .then(async embedMsg => {
        const emojiNeeded = ['⬅', '➡', '🇽'];

        const filter = (reaction, user) => {
          return emojiNeeded.includes(reaction.emoji.name) && user.id === msg.author.id;
        };

        const collector = embedMsg.createReactionCollector(filter, { time: 60000, dispose: true });

        collector.on('collect', async collected => {
          if (collected.emoji.name === emoji.x) {
            embedMsg.delete();
          } else if (collected.emoji.name === '⬅') {
            // decrement index for list
            page--;
            index -= itemsPerPage;
            if (page < 0) {
              page = 0;
              index = 0;
              return;
            }
          } else if (collected.emoji.name === '➡') {
            // increment index for list
            page++;
            index += itemsPerPage;
            // when page exceed the max of video length
            if (page + 1 > Math.ceil(queue.length / itemsPerPage)) {
              page = (Math.ceil(queue.length / itemsPerPage)) - 1;
              index -= itemsPerPage;
              return;
            }
          }
          if (collected.emoji.name === '➡' || collected.emoji.name === '⬅') {
            return embedMsg.edit({ embed: setEmbedQueueCmd(queue, index, page, msg, itemsPerPage) });
          }

        });

        // reacting the message
        if (queue.length > itemsPerPage) {
          for (let i = 0; i < emojiNeeded.length; i++) {
            await embedMsg.react(emojiNeeded[i]);
          }
        } else {
          embedMsg.react(emoji.x);
        }
      });
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
