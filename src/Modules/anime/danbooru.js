const axios = require('axios').default;
const { stripIndents } = require('common-tags');
const Command = require('../../structures/Command.js');

module.exports = class DanbooruCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'danbooru',
      group: 'anime',
      memberName: 'danbooru',
      description: 'Search for random anime image from danbooru.',
      examples: ['danbooru 1girl twintails dress', 'danbooru genshin_impact', 'danbooru azur_lane 5'],
      details: stripIndents`
        If the tags contain 2 or more words, you must use underscore to combine them for danbooru,
        **e.g.** if you want a character with **blue hair** then it'll be typed like **blue_hair**. 
        Use spacebar to search if an image has all the specified tag, **e.g. blue_eyes long_hair**.
        Maximum tag allowed is just 2 tags.
        If you want to request more than 1 image, put a number in the end of the arg.
        If no tag is specified then it'll give you random image.
      `,
      nsfw: true,
      throttling: {
        usages: 3,
        duration: 16,
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
    let numOfImages = parseInt(tag.split(/\s+/).pop());
    if (numOfImages && numOfImages > 10) {
      return msg.reply(`The maximum number of images that can be requested is 10`);
    } else if (numOfImages) { // if user define limit then delete the limit from tag arg
      tag = tag.slice(0, tag.length - numOfImages.toString().length - 1);
    } else {
      numOfImages = 1;
    }
    const splittedTags = tag.split(/\s+/);
    const cencoredTags = ['loli', 'shota', 'toddlercon'];
    if (splittedTags.some((e) => cencoredTags.includes(e))) {
      return msg.reply(`You have entered tags that are not allowed. Please try another one.`);
    }
    if (splittedTags.length > 2) {
      return msg.reply(`Maximum tags is 2, but ${splittedTags.length} is given`);
    }
    const encodedTags = escape(tag.replace(/\s+/g, '+'));
    try {
      const countsUrl = `https://danbooru.donmai.us/counts/posts.json?tags=${encodedTags}`;
      const counts = await axios.get(countsUrl).then(res => res.data.counts.posts);
      let page;
      let limit = 20;

      if (!counts) {
        return msg.reply(`No image found with that tag.`);
      } else if (counts < limit) {
        numOfImages = counts;
        limit = counts;
        page = 1;
      } else if (counts > 20000) {
        limit = 100;
        if (counts > 100000) {
          page = Math.floor(Math.random() * 1001);
        } else {
          page = Math.floor(Math.random() * (counts / limit));
        }
      } else {
        page = Math.floor(Math.random() * (counts / limit));
      }

      const imgListUrl = `https://danbooru.donmai.us/posts.json?tags=${encodedTags}&limit=${limit}&page=${page}`;
      const imageList = await axios.get(imgListUrl).then(res => res.data);
      const randStart = Math.floor(Math.random() * (limit / numOfImages)); // randomize starting point of image to be sent
      for (let i = randStart * numOfImages; i < ((randStart * numOfImages) + numOfImages); i++) {
        if (imageList[i].large_file_url) {
          msg.say(imageList[i].large_file_url);
        }
      }
    } catch (err) {
      logger.error(err.stack);
      msg.reply(`There was an error when requesting the image. Please try again later`);
    }
  }
};
