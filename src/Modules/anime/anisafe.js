const axios = require('axios').default;
const { oneLine } = require('common-tags');
const { Command } = require('discord.js-commando');

module.exports = class AniSafeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'anisafe',
      group: 'anime',
      memberName: 'anisafe',
      description: 'Search for random anime image.',
      details: oneLine`
      Available tag are :
      <'meow', 'avatar', 'fox_girl', 'gecg', 'kemonomimi', 'holo', 'wallpaper', 'neko', 'waifu', 'erokemo'>
      Service used is nekos.life
      `,
      examples: ['anisafe', 'anisafe neko'],
      throttling: {
        usages: 2,
        duration: 15,
      },
      args: [
        {
          key: 'tag',
          prompt: 'What genre/tag do you want to see?',
          type: 'string',
          default: '',
        }
      ],
    });
  }

  // Thanks to nekos.life for the service
  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg, { tag }) {
    const safeTag = [
      'meow', 'avatar', 'fox_girl', 'gecg', 'kemonomimi', 'holo',
      'wallpaper', 'neko', 'waifu', 'erokemo'
    ];
    if (tag !== '' && !safeTag.includes(tag.toLowerCase())) {
      return msg.reply(oneLine`
        Invalid tag, you can see available tag in \`${msg.guild.commandPrefix}help hentai\`
      `).then(resMsg => resMsg.delete({ timeout: 8000 })).catch(e => e);
    }

    const getRandomTag = safeTag[Math.floor(Math.random() * safeTag.length)];
    try {
      const res = await axios.get(`https://nekos.life/api/v2/img/${tag ? tag : getRandomTag}`);
      return msg.say(res.data.url);
    } catch (err) {
      logger.log('error', err.stack);
      msg.reply(`There was an error when requesting the image. Please try again later`);
    }
  }
};
