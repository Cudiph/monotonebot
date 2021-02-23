const { oneLine, stripIndents } = require('common-tags');
const Command = require('../../structures/Command.js');
const gtrans = require('node-gtrans');

const trim = (str, max) => ((str.length > max) ? `${str.slice(0, max - 3)}...` : str);

module.exports = class AddPlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'translate',
      group: 'util',
      memberName: 'translate',
      aliases: ['trans', 't'],
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

  /** @param {import('discord.js-commando').CommandoMessage} msg */
  async run(msg, { language, words }) {
    let lang;
    if (language.match(/(?:\w+)>(?:\w+)/)) {
      lang = language.split('>');
    } else {
      lang = language.split();
    }
    const sl = language.match(/(\w+)>(\w+)/) ? lang[0] : 'auto';
    const tl = language.match(/(\w+)>(\w+)/) ? lang[1] : lang[0];

    let result;
    const newWords = words.split(/ +/).join(' ');
    try {
      result = await gtrans(newWords, { from: sl, to: tl })
        .then(response => response.data);
      if (!result) {
        return;
      }
    } catch (err) {
      logger.log('error', err);
      return msg.say('An error occured. It maybe the API request is blocked or the language id is incorrect. Please try again later')
        .then(errMsg => errMsg.delete({ timeout: 10000 })).catch(e => e);
    }

    const embed = {
      color: 0x53bcfc,
      fields: [],
      footer: {
        text: `Translated from ${result.from} to ${result.to}`,
        icon_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Google_Translate_logo.svg/1200px-Google_Translate_logo.svg.png',
      }
    };

    if (newWords.length > 1024) {
      embed.title = `Translated Text`;
      embed.description = trim(result.translated, 2048);
    } else {
      embed.fields.push(
        {
          name: 'Source Text',
          value: `${trim(newWords, 1024)}`,
          inline: newWords.length < 20 ? true : false,
        },
        {
          name: 'Translated Text',
          value: `${trim(result.translated, 1024)}`,
          inline: newWords.length < 20 ? true : false,
        });
    }

    if (result.pronunciation) {
      embed.fields.push({
        name: `pronunciation`,
        value: `${result.pronunciation}`,
        inline: true,
      });
    }

    if (result.isCorrected) {
      embed.fields.push({
        name: `Corrected text`,
        value: `${trim(result.corrected, 1024)}`
      });
    }

    if (result.translations) {
      for (const key in result.translations) {
        const translationsArray = [];
        for (const iter of result.translations[key]) {
          if (translationsArray.length >= 3) break;
          translationsArray.push(oneLine`
              **${iter.word}:** ${iter.translations.join(', ')} *${iter.frequency}*
            `);
        }
        embed.fields.push({
          name: `Alternate Translation in ${key}`,
          value: translationsArray.join('\n'),
        });
      }
    }

    if (result.synonyms) {
      for (const key in result.synonyms) {
        const commonSyns = result.synonyms[key].map(elem => {
          return elem[0];
        });
        embed.fields.push({
          name: `Top synonyms for ${key}`,
          value: `${commonSyns.join(', ')}`
        });
      }
    }

    if (result.definitions) {
      for (const key in result.definitions) {
        const defArray = [];
        // const thisLength = result.definitions[key].length > 3 ? 3 : result.definitions[key].length;
        for (let i = 0; i < 1; i++) {
          const synonyms = result.definitions[key][i].synonyms.slice(0, 3).join(', ');
          defArray.push(stripIndents`
              __Definition:__ ${result.definitions[key][i].definition}
              ${result.definitions[key][i].example ? `__Example:__ "${result.definitions[key][i].example}"` : ''}
              ${synonyms ? `__Synonyms:__ ${synonyms}` : ''}
            `);
        }
        embed.fields.push({
          name: `Definitions in ${key}`,
          value: defArray.join('\n\n'),
        });
      }
    }

    if (result.related) {
      embed.fields.push({
        name: `Related`,
        value: `${result.related}`
      });
    }

    return msg.say({ embed });
  }

};
