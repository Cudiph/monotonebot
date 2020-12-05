const { oneLine } = require('common-tags');
const { Command } = require('discord.js-commando');
const axios = require('axios').default;

module.exports = class ShortenCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'shorten',
      group: 'util',
      memberName: 'shorten',
      description: 'Shorten given url',
      examples: ['shorten https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.youtube.com%2Fchannel%2FUCZ5XnGb-3t7jCkXdawN2tkA&psig=AOvVaw06iKNaVxxmOsCw5TdBgx2J&ust=1602690435882000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCOiHnaX1sewCFQAAAAAdAAAAABAD',
        'short https://www.youtube.com/watch?v=dEI7oX0XxJw myfavsvidofalltime', 'shorten youtube.com'],
      aliases: ['short'],
      details: oneLine`
      First argument is the url you want to shorten and second argument is specified short url
      (optional), These must be between 5 and 30 characters long and can only contain alphanumeric
      characters and underscores (case sensitive).
      `,
      throttling: {
        usages: 2,
        duration: 20,
      },
      args: [
        {
          key: 'longUrl',
          prompt: 'Please put the long url.',
          type: 'string',
        },
        {
          key: 'customUrl',
          prompt: 'Please put the custom short url.',
          type: 'string',
          default: '',
        },

      ]
    })
  }

  async run(msg, { longUrl, customUrl }) {
    let shortUrl;
    try {
      shortUrl = await axios.get(`https://is.gd/create.php`, {
        params: {
          format: 'simple',
          url: encodeURIComponent(longUrl),
          shorturl: encodeURIComponent(customUrl),
        }
      });
    } catch (err) {
      if (err.response) {
        return msg.reply(err.response.data.split(':')[1]);
      }
    }

    msg.say({
      embed: {
        color: 0x11ff00,
        fields: [
          {
            name: `Long URL`,
            value: longUrl.startsWith('http') ? longUrl : `https://${longUrl}`,
          },
          {
            name: `Short URL`,
            value: shortUrl.data
          }
        ]
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
