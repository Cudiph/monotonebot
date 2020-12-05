const axios = require('axios').default;
const { Command } = require('discord.js-commando');

module.exports = class UrbandictCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'boobs',
      group: 'search',
      memberName: 'boobs',
      description: 'Search for random b00bs',
      examples: ['boobs'],
      nsfw: true,
      throttling: {
        usages: 4,
        duration: 20,
      },
      args: [
        {
          key: 'count',
          prompt: 'What word you want to find?',
          type: 'integer',
          default: 1,
          min: 1,
          max: 5,
        }
      ],
    })
  }

  async run(msg, { count }) {
    const random = Math.random();
    let res;
    if (random > 0.5) {
      try {
        res = await axios.get(`http://api.oboobs.ru/boobs/random/${count}/random`);
        for (let i = 0; i < res.data.length; i++) {
          const getImageName = res.data[i].preview.split('/')[1]
          let url = `http://media.oboobs.ru/boobs/${getImageName}`;
          msg.say(url);
        }
      } catch (err) {
        logger.log('error', err + ' at boobs.js')
        return msg.say('There was an error when requesting an image, please try again later');
      }
    } else {
      try {
        res = await axios.get(`http://api.oboobs.ru/noise/${count}`);
        for (let i = 0; i < res.data.length; i++) {
          const getImageName = res.data[i].preview.split('/')[1]
          let url = `http://media.oboobs.ru/noise/${getImageName}`;
          msg.say(url);
        }
      } catch (err) {
        logger.log('error', err + ' at boobs.js')
        return msg.say('There was an error when requesting an image, please try again later');
      }
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
