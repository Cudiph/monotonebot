const axios = require('axios').default;
const { oneLine } = require('common-tags');
const { Command } = require('discord.js-commando');

module.exports = class UrbandictCommand extends Command {
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
        usages: 4,
        duration: 10,
      },
      args: [
        {
          key: 'tag',
          prompt: 'What genre/tag you want to see?',
          type: 'string',
          default: '',
        }
      ],
    })
  }

  // Thanks to nekos.life for the service
  async run(msg, { tag }) {
    const safeTag = [
      'meow', 'avatar', 'fox_girl', 'gecg', 'kemonomimi', 'holo',
      'wallpaper', 'neko', 'waifu', 'erokemo'
    ]
    if (tag !== '' && !safeTag.includes(tag.toLowerCase())) {
      return msg.reply(oneLine`
        Invalid tag, you can see available tag in \`${msg.guild.commandPrefix}help hentai\`
      `).then(msg => msg.delete({ timeout: 8000 }));
    }

    const getRandomTag = safeTag[Math.floor(Math.random() * safeTag.length)];
    try {
      let res = await axios.get(`https://nekos.life/api/v2/img/${tag ? tag : getRandomTag}`);
      return msg.say(res.data.url);
    } catch (err) {
      logger.log('error', err + ' at hentai.js')
      msg.reply(`There was an error when requesting the link. Please try again later`);
    }
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
