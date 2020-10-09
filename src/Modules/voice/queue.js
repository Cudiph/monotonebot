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
      examples: ['queue', 'q'],
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 10,
      },
    })
  }

  async run(msg) {
    if (!msg.guild.queue) {
      return msg.say(`There is no queue.`);
    }

    // variabel to store data :)
    let queue = msg.guild.queue;
    let page = 0;
    let index = 0;
    let itemsPerPage = 9;

    // send embed
    msg.channel.send({ embed: setEmbedQueueCmd(queue, index, page, msg, itemsPerPage) })
      .then(async embedMsg => {
        let emojiNeeded = ['⬅', '➡', '🇽'];

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

        })

        // reacting the message
        if ((page + 1) !== Math.ceil(queue.length / itemsPerPage)) {
          for (let i = 0; i < emojiNeeded.length; i++) {
            await embedMsg.react(emojiNeeded[i]);
          }
        }
      })
  }

  async onBlock(msg, reason, data) {
    let parent = await super.onBlock(msg, reason, data);
    parent.delete({ timeout: 9000 });
  }

  onError(err, message, args, fromPattern, result) {
    super.onError(err, message, args, fromPattern, result)
      .then(msgParent => msgParent.delete({ timeout: 9000 }));
  }
}
