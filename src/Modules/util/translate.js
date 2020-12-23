const { oneLine } = require('common-tags');
const { Command } = require('discord.js-commando');
const axios = require('axios').default;
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
      \nYou can see language id [here](https://cloud.google.com/translate/docs/languages).
      `,
      throttling: {
        usages: 3,
        duration: 10,
      },
      args: [
        {
          key: 'language',
          prompt: 'What language you want to translated? (`en>id` or `id` for auto)',
          type: 'string',
        },
        {
          key: 'words',
          prompt: 'Words you want to translated.',
          type: 'string',
        }
      ],
    });
  }

  async run(msg, { language, words }) {
    let lang;
    if (language.match(/(?:\w+)>(?:\w+)/)) {
      lang = language.split('>');
    } else {
      lang = language.split();
    }
    const sl = language.match(/(\w+)>(\w+)/) ? lang[0] : 'auto';
    const tl = language.match(/(\w+)>(\w+)/) ? lang[1] : lang[0];
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
      q: words.split(/\s+/).join(' '),
    });
    // https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ja&hl=ja&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&ie=UTF-8&oe=UTF-8&otf=1&ssel=0&tsel=0&kc=7&q=i%20love%20you
    let result;
    try {
      result = await axios.get(`https://translate.googleapis.com/translate_a/single?${property}`)
        .then(response => response.data);
      if (!result) {
        return;
      }
    } catch (err) {
      logger.log('error', err);
      return msg.say('An error occured. It maybe the API request is blocked or the language id is incorrect')
        .then(errMsg => errMsg.delete({ timeout: 10000 }));
    }

    let embed;
    const langId = result[0][0][8] ? result[0][0][8][0][0][1].match(/(?:[a-zA-Z]+_)?(\w{2})_(\w{2})_(?:.*)/) : result[0][0][8] = false;
    // let sourceId = result[0][0][8][0][0][1].substr(0, 2).toUpperCase();
    // let transId = result[0][0][8][0][0][1].substr(3, 2).toUpperCase();
    try {
      embed = {
        color: 0x53bcfc,
        fields: [],
        footer: {
          text: oneLine`Translated from
        ${words.split(/\s+/).length == 1 && result[1] ? sl.toUpperCase() : result[0][0][8] ? langId[1].toUpperCase() : sl.toUpperCase()}
        to ${words.split(/\s+/).length == 1 && result[1] ? tl.toUpperCase() : result[0][0][8] ? langId[2].toUpperCase() : tl.toUpperCase()}
        `,
          icon_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Google_Translate_logo.svg/1200px-Google_Translate_logo.svg.png',
        }
      };
    } catch (err) {
      logger.log('error', err);
      return msg.say('Please check again your input')
        .then(resMsg => resMsg.delete({ timeout: 10000 }));
    }

    if (words.split(/\s+/).length == 1 && result[1]) {
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
        });
      });
    } else if (words.split(/\s+/).length < 25) {
      embed.fields.push(
        {
          name: 'Source Text',
          value: `${result[0][0][1]}`
        },
        {
          name: 'Translated Text',
          value: `${result[0][0][0]}`
        });
    } else {
      embed.title = 'Translated Text';
      let translated = '';
      result[0].forEach(text => {
        translated += text[0] + '\n\n';
      });
      embed.description = trim(translated, 2048);
    }
    return msg.say({ embed });
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
