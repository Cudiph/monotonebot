const { stripIndents } = require('common-tags');
const { Command } = require('discord.js-commando');
const { userDataSchema } = require('../../library/Database/schema');

module.exports = class MyInfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'myinfo',
      group: 'util',
      memberName: 'myinfo',
      aliases: ['mystats'],
      description: 'myinfo someone with mentioning in a server',
      throttling: {
        usages: 1,
        duration: 30,
      },
      examples: ['myinfo @epicgamers Hello;Nice too meet you', 'email @0xDeadBeef Title;Desc'],
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
