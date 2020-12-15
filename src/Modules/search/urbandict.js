const axios = require('axios').default;
const querystring = require('querystring');
const { Command } = require('discord.js-commando');

module.exports = class UrbandictCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'urbandict',
      group: 'search',
      memberName: 'urbandict',
      aliases: ['ud', 'urbandictionary'],
      description: 'Search for slang words and phrases',
      examples: ['ud Hello World', 'urbandict bruh'],
      throttling: {
        usages: 1,
        duration: 10,
      },
      args: [
        {
          key: 'query',
          prompt: 'What word you want to find?',
          type: 'string',
        }
      ]
    })
  }

  async run(message, args) {
    if (!args) {
      return message.channel.send('You need to supply a search term!');
    }
    // define the query
    const query = querystring.stringify({ term: args.query });
    // fetching request
    const { list } = await axios.get(`https://api.urbandictionary.com/v0/define?${query}`).then(res => res.data);
    // return if no result
    if (!list || !list.length) {
      return message.say('No words found');
    }

    // trim words if too long
    const trim = (str, max) => ((str.length > max) ? `${str.slice(0, max - 3)}...` : str);
    let counter = 0

    let embed = {
      color: 0xff548e,
      title: list[counter].word,
      url: list[counter].permalink,
      author: {
        name: `Author : ${list[counter].author}`
      },
      fields: [
        {
          name: 'Definition',
          value: trim(list[counter].definition, 1024)
        },
        {
          name: 'Example',
          value: trim(list[counter].example, 1024)
        },
        {
          name: 'Rating',
          value: `👍 ${list[counter].thumbs_up}`,
          inline: true
        },
        {
          name: '\u200b',
          value: `👎 ${list[counter].thumbs_down}`,
          inline: true
        }
      ],
      footer: {
        text: `${counter + 1}/${list.length}`
      }
    }

    message.channel.send({ embed: embed })
      .then(async msg => {
        let emojiNeeded = ['⬅', '➡', '🇽']

        const filter = (reaction, user) => {
          return emojiNeeded.includes(reaction.emoji.name) && user.id === message.author.id;

        };
        const collector = msg.createReactionCollector(filter, { time: 40000, dispose: true });
        // when reeaction are collected
        collector.on('collect', async collected => {
          if (collected.emoji.name === '🇽') {
            return msg.delete();
          } else if (collected.emoji.name === '⬅') {
            // decrement index for list
            counter--;
            if (counter < 0) counter = 0;
          } else if (collected.emoji.name === '➡') {
            // increment index for list
            counter++;
            if (counter >= list.length) counter = list.length - 1;
          }
          var embed2 = {
            color: 0xff548e,
            title: list[counter].word,
            url: list[counter].permalink,
            author: {
              name: `Author : ${list[counter].author}`
            },
            fields: [
              {
                name: 'Definition',
                value: trim(list[counter].definition, 1024)
              },
              {
                name: 'Example',
                value: trim(list[counter].example, 1024)
              },
              {
                name: 'Rating',
                value: `👍 ${list[counter].thumbs_up}`,
                inline: true
              },
              {
                name: '\u200b',
                value: `👎 ${list[counter].thumbs_down}`,
                inline: true
              }
            ],
            footer: {
              text: `${counter + 1}/${list.length}`
            }
          }
          msg.edit({ embed: embed2 });
        })
        // on remove the same as above
        collector.on('remove', async collected => {
          if (collected.emoji.name === '⬅') {
            // decrement index for list
            counter--;
            if (counter < 0) counter = 0;
          } else if (collected.emoji.name === '➡') {
            // increment index for list
            counter++;
            if (counter >= list.length) counter = list.length - 1;
          }
          var embed2 = {
            color: 0xff548e,
            title: list[counter].word,
            url: list[counter].permalink,
            author: {
              name: `Author : ${list[counter].author}`
            },
            fields: [
              {
                name: 'Definition',
                value: trim(list[counter].definition, 1024)
              },
              {
                name: 'Example',
                value: trim(list[counter].example, 1024)
              },
              {
                name: 'Rating',
                value: `👍 ${list[counter].thumbs_up}`,
                inline: true
              },
              {
                name: '\u200b',
                value: `👎 ${list[counter].thumbs_down}`,
                inline: true
              }
            ],
            footer: {
              text: `${counter + 1}/${list.length}`
            }
          }

          msg.edit({ embed: embed2 });
        })

        // react to the msg
        for (let i = 0; i < emojiNeeded.length; i++) {
          await msg.react(emojiNeeded[i]);
        }

      }).catch(err => logger.log('error', err));

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
}
