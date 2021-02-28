const Command = require('../../structures/Command.js');
const Util = require('../../util/Util.js');

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

  /** @param {import('discord.js-commando').CommandoMessage} msg */
  async run(msg, { toPage, itemsPerPage }) {
    if (!msg.guild.queue.length) {
      return msg.say(`There is no queue.`);
    }

    // navigation vars
    const queue = msg.guild.queue;
    let page = toPage;
    // let itemsPerPage = 9;
    let index = page * itemsPerPage - itemsPerPage;

    if (page > Math.ceil(queue.length / itemsPerPage)) {
      page = Math.ceil(queue.length / itemsPerPage);
      index = page * itemsPerPage - itemsPerPage;
    }

    // send embed
    const embedMsg = await msg.embed(msg.createEmbedQueue(index, page, itemsPerPage));

    const emojiNeeded = ['⬅', '➡', '🇽'];

    const filter = (reaction, user) => {
      return emojiNeeded.includes(reaction.emoji.name) && user.id === msg.author.id;
    };

    const collector = embedMsg.createReactionCollector(filter, { time: 60000 });

    collector.on('collect', async collected => {
      if (collected.emoji.name === Util.emoji.x) {
        embedMsg.delete();
      } else if (collected.emoji.name === '⬅') {
        // decrement index for list
        page--;
        index -= itemsPerPage;
        if (page < 1) {
          page = 1;
          index = 0;
          return;
        }
      } else if (collected.emoji.name === '➡') {
        // increment index for list
        page++;
        index += itemsPerPage;
        // when page exceed the max of video length
        if (page > Math.ceil(queue.length / itemsPerPage)) {
          page = Math.ceil(queue.length / itemsPerPage);
          index -= itemsPerPage;
          return;
        }
      }
      if (collected.emoji.name === '➡' || collected.emoji.name === '⬅') {
        return embedMsg.edit({ embed: embedMsg.createEmbedQueue(index, page, itemsPerPage) });
      }

    });

    // reacting to the message
    if (queue.length > itemsPerPage) {
      for (let i = 0; i < emojiNeeded.length; i++) {
        await embedMsg.react(emojiNeeded[i]);
      }
    } else {
      embedMsg.react(Util.emoji.x);
    }
  }


};
