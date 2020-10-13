const { oneLine } = require('common-tags');
const { Command } = require('discord.js-commando');
const fetch = require('node-fetch');
const querystring = require('querystring');

const trim = (str, max) => ((str.length > max) ? `${str.slice(0, max - 3)}...` : str);

module.exports = class AddPlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'translate',
      group: 'util',
      memberName: 'translate',
      aliases: ['trans'],
      description: 'Translate any word',
      examples: ['translate en>id I love you', 'trans ru putin is the best'],
      argsType: 'multiple',
      details: oneLine`
      Single word will give more detailed information such as noun example etc. If you
      just give only one language id (trans ru ...) it's the same like auto>ru, auto mean
      it'll auto detect the source text.
      \nYou can see language id [here](https://cloud.google.com/translate/docs/languages)
      `,
      throttling: {
        usages: 1,
        duration: 10,
      },
    })
  }

  async run(msg, args) {
    if (args[0].match(/(?:\w+)>(?:\w+)/)) {
      var lang = args.join(' ').split('>').join(' ').split(' ');
    } else {
      var lang = args;
    }
    let sl = args[0].match(/(\w+)>(\w+)/) ? lang[0] : 'auto';
    let tl = args[0].match(/(\w+)>(\w+)/) ? lang[1] : lang[0];
    const property = querystring.stringify({
      client: 'gtx',
      sl: sl,
      tl: tl,
      hl: tl,
      dt: ['at', 'bd', 'ex', 'ld', 'md', 'qca', 'rw', 'rm', 'ss', 't'],
      ie: 'UTF-8',
      oe: 'UTF-8',
      otf: 1,
      ssel: 0,
      tsel: 0,
      kc: 7,
      q: args.slice(1).join(' '),
    })

    let result;
    try {
      result = await fetch(`https://translate.googleapis.com/translate_a/single?${property}`).then(response => response.json());
      if (!result) {
        return;
      }
    } catch (err) {
      return msg.say('An error occured. It maybe the API is blocked');
    }

    let embed;
    try {
      embed = {
        color: 0x53bcfc,
        fields: [],
        footer: {
          text: oneLine`Translated from
        ${args.slice(1).length == 1 && result[1] ? sl : result[0][0][8] ? result[0][0][8][0][0][1].substr(0, 2).toUpperCase() : sl}
        to ${args.slice(1).length == 1 && result[1] ? tl : result[0][0][8] ? result[0][0][8][0][0][1].substr(3, 2).toUpperCase() : tl}
        `,
          icon_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Google_Translate_logo.svg/1200px-Google_Translate_logo.svg.png',
        }
      }
    } catch (err) {
      logger.log('error', err);
      return msg.say('Please check again you argument');
    }

    if (args.slice(1).length == 1 && result[1]) {
      embed.fields.push(
        {
          name: 'Source Text',
          value: `${result[0][0][1]}`
        },
        {
          name: 'Translated Text',
          value: `${result[0][0][0]}`
        });
      result[1].forEach(elem => {
        let value = '';
        if (elem[1]) {
          elem[1].forEach(elem2 => value += elem2 + ', ');
        }

        embed.fields.push({
          name: elem[0],
          value: value,
          inline: true,
        })
      })
    } else if (args.length < 25) {
      embed.fields.push(
        {
          name: 'Source Text',
          value: `${result[0][0][1]}`
        },
        {
          name: 'Translated Text',
          value: `${result[0][0][0]}`
        })
    } else {
      embed.title = 'Translated Text'
      let translated = '';
      result[0].forEach(text => {
        translated += text[0] + '\n\n';
      })
      embed.description = trim(translated, 2048);
    }
    return msg.say({ embed })
  }

  async onBlock(msg, reason, data) {
    let parent = await super.onBlock(msg, reason, data);
    parent.delete({ timeout: 9000 })
  }

  onError(err, message, args, fromPattern, result) {
    super.onError(err, message, args, fromPattern, result)
      .then(msgParent => msgParent.delete({ timeout: 9000 }));
  }
}
