const axios = require('axios').default;
const { stripIndents } = require('common-tags');
const { Command } = require('discord.js-commando');

module.exports = class E621Command extends Command {
  constructor(client) {
    super(client, {
      name: 'e621',
      group: 'search',
      memberName: 'e621',
      description: 'Search for furry image from e621.',
      examples: ['e621 wings blonde_hair'],
      details: stripIndents`
        If the tags contain 2 or more words, you must use underscore to combine them.
        if you want a character with **blue hair** then it'll be typed like **blue_hair**. 
        Use spacebar to search if an image has all the specified tag, **e.g. blue_eyes wings**.
        Currently doesn't support bulk image.
      `,
      nsfw: true,
      throttling: {
        usages: 3,
        duration: 15,
      },
      args: [
        {
          key: 'tag',
          prompt: 'What tag do you want to see?',
          type: 'string',
          default: '',
        }
      ],
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg, { tag }) {
    const encodedTags = encodeURIComponent(tag.replace(/\s+/g, ' ')).replace(/%20/g, '+');
    try {
      const imgUrl = `https://e621.net/posts/random.json?tags=${encodedTags}`;
      const imgObj = await axios.get(imgUrl).then(res => res.data);
      return msg.say(imgObj.post.file.url);
    } catch (err) {
      if (err.message.includes('404')) {
        return msg.reply(`Image not found`);
      }
      logger.log('error', err.stack);
      msg.reply(`There was an error when requesting the image. Please try again later`);
    }
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
