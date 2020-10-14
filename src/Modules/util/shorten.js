const { oneLine } = require('common-tags');
const { Command } = require('discord.js-commando');
const fetch = require('node-fetch');

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
      argsType: 'multiple',
      throttling: {
        usages: 3,
        duration: 18,
      },
    })
  }

  async run(msg, args) {
    const shortUrl = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(args[0])}&shorturl=${encodeURIComponent(args.slice(1).join(''))}`)
      .then(res => res.text());
    if (!shortUrl.startsWith('https')) {
      return msg.say(`${shortUrl}`)
    }
    msg.say({
      embed: {
        color: 0x11ff00,
        fields: [
          {
            name: `Long URL`,
            value: `[${args[0]}](${args[0]})`
          },
          {
            name: `Short URL`,
            value: `[${shortUrl}](${shortUrl})`
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
