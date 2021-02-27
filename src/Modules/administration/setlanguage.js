const Command = require('../../structures/Command.js');
const gtrans = require('node-gtrans');
const { guildSettingsSchema } = require('../../util/schema.js');
const { oneLine } = require('common-tags');


module.exports = class SetLanguageCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'setlanguage',
      aliases: ['setlang', 'lang'],
      group: 'administration',
      memberName: 'setlanguage',
      description: 'Set bot language to speak',
      details: oneLine`
        Using the same translator like the translate command.
        Don't know your language code? see
        [google translate docs](https://cloud.google.com/translate/docs/languages)
      `,
      examples: ['setlanguage id', 'lang de'],
      userPermissions: ['ADMINISTRATOR'],
      guildOnly: true,
      args: [
        {
          key: 'language',
          prompt: 'What language do you want me to speak? (ISO 639-1 code)',
          type: 'string',
          validate: (val) => {
            if (!gtrans.validateLangId(val)) {
              return `Don't know your language code? see <https://cloud.google.com/translate/docs/languages>`;
            }
            return Boolean(gtrans.validateLangId(val));
          },
        },
      ],
    });
  }

  /** @param {import('discord.js-commando').CommandoMessage} msg */
  async run(msg, { language }) {
    const currentLang = gtrans.validateLangId(language);

    if (msg.guild.language === language) return msg.said(`I already speak ${currentLang}`);

    msg.guild.language = language;
    await guildSettingsSchema.findOneAndUpdate({ guildId: msg.guild.id }, {
      language
    }, { upsert: true });
    msg.sendToLogChan({
      strMsg: `New language has been set! Now I will speak **${currentLang}**.`
    });
  }

};
