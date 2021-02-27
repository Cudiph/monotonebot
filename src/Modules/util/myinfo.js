const { stripIndents } = require('common-tags');
const Command = require('../../structures/Command.js');
const { userDataSchema } = require('../../util/schema');

module.exports = class MyInfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'myinfo',
      group: 'util',
      memberName: 'myinfo',
      aliases: ['mystats'],
      description: 'Your info such as your level in the bot database',
      throttling: {
        usages: 1,
        duration: 30,
      },
      examples: ['myinfo'],
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg) {
    let userData;
    try {
      userData = await userDataSchema.findOne({ userId: msg.author.id });
    } catch (err) {
      logger.log('error', err.stack);
      return msg.reply(`Can't load the data, please try again later`);
    }

    const firstLevel = 20;
    let levelDivider = firstLevel;
    let level = 0;
    let nearestLevelPoint = firstLevel;
    for (let i = userData.exp; i >= firstLevel; i -= levelDivider) {
      level++;
      levelDivider += 25;
      nearestLevelPoint += levelDivider;
    }
    const percentage = userData.exp / nearestLevelPoint * 100;
    const timeline = ['**', '▷', '**'];
    for (let i = 0; i < 100; i += 5) {
      if (i > percentage) {
        timeline.splice(timeline.length, 0, '-');
      } else {
        timeline.splice(1, 0, '=');
      }
    }

    msg.reply(stripIndents`
      You have reached **level ${level}**
      Call me **${nearestLevelPoint - userData.exp}** more times to reach next level
      Graph: ${timeline.join('')}  ${userData.exp} / ${nearestLevelPoint}

      You have **$${userData.money}** in your pocket
      Our first met was at **${userData.createdAt.toUTCString()}**
    `);

  }

};
