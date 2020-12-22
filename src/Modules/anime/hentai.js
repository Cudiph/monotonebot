const axios = require('axios').default;
const { oneLine } = require('common-tags');
const { Command } = require('discord.js-commando');

module.exports = class HentaiCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'hentai',
      group: 'anime',
      memberName: 'hentai',
      description: 'Search for random hentai image or gif.',
      details: oneLine`
      Available tag are :
      <
        'femdom', 'erofeet', 'erok', 'hololewd', 'lewdk', 'keta', 'eroyuri', 'tits', 'pussy_jpg',
        'cum_jpg', 'lewdkemo', 'lewd', 'cum', 'nsfw_avatar', 'feet', 'yuri', 'trap', 'blowjob',
        'holoero', 'hentai', 'futanari', 'ero', 'solo', 'eron', 'classic', 'les',
        'feetg', 'nsfw_neko_gif', 'kuni', 'pussy', 'spank', 'Random_hentai_gif',
        'boobs', 'solog', 'bj', 'anal', 'pwankg'
      >
      `,
      examples: ['hentai', 'hentai yuri'],
      nsfw: true,
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
    })
  }

  // Thanks to nekos.life for the service
  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg, { tag }) {
    const nsfwTag = [
      'femdom', 'erofeet', 'erok', 'hololewd', 'lewdk', 'keta', 'eroyuri', 'tits', 'pussy_jpg',
      'cum_jpg', 'lewdkemo', 'lewd', 'cum', 'nsfw_avatar', 'feet', 'yuri', 'trap', 'blowjob',
      'holoero', 'hentai', 'futanari', 'ero', 'solo', 'eron', 'classic', 'les',
      'feetg', 'nsfw_neko_gif', 'kuni', 'pussy', 'spank', 'Random_hentai_gif', 'boobs',
      'solog', 'bj', 'anal', 'pwankg'
    ]
    if (tag !== '' && !nsfwTag.includes(tag.toLowerCase())) {
      return msg.reply(oneLine`
        Invalid tag, you can see available tag in \`${msg.guild.commandPrefix}help hentai\`
      `).then(msg => msg.delete({ timeout: 8000 }));
    }

    const getRandomTag = nsfwTag[Math.floor(Math.random() * nsfwTag.length)];
    try {
      let res = await axios.get(`https://nekos.life/api/v2/img/${tag ? tag : getRandomTag}`);
      return msg.say(res.data.url);
    } catch (err) {
      logger.log('error', err.stack)
      msg.reply(`There was an error when requesting the image. Please try again later`);
    }
  }

}
