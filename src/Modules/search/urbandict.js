const fetch = require('node-fetch');
const querystring = require('querystring');

module.exports = {
  name: 'urbandictionary',
  cooldown: 10,
  usage: '<query>',
  args: true,
  aliases: ['ud', 'urbandict'],
  description: 'Send definition of slang or cultural words from urbandictionary.com',
  async execute(message, args) {
    if (!args) {
      return message.channel.send('You need to supply a search term!');
    }
    // define the query
    const query = querystring.stringify({ term: args.join(' ') });
    // fetching request
    const { list } = await fetch(`https://api.urbandictionary.com/v0/define?${query}`).then(response => response.json());
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
        await msg.react('⬅');
        await msg.react('➡');

        const filter = (reaction, user) => {
          return ['⬅', '➡'].includes(reaction.emoji.name) && user.id === message.author.id;

        };
        const collector = msg.createReactionCollector(filter, { time: 40000, dispose: true });
        // when reeaction are collected
        collector.on('collect', async collected => {
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
              text: `${counter +1}/${list.length}`
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
            if (counter >= list.length) counter = list.length - 1 ;
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
      }).catch(error => console.error(error))

  }
}