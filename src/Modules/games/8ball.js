const Discord = require('discord.js');
const Command = require('../../structures/Command.js');

module.exports = class EightBallCommand extends Command {
  constructor(client) {
    super(client, {
      name: '8ball',
      group: 'games',
      memberName: '8ball',
      description: 'Answer your question',
      examples: ['8ball Are Ya Winning Son?'],
      args: [{
        key: 'question',
        prompt: 'What\'s your question?',
        type: 'string',
      }],
      throttling: {
        usages: 4,
        duration: 10,
      },
    });
  }

  /** @param {import('discord.js-commando').CommandoMessage} msg */
  async run(msg, { question }) {
    if (!question.length) {
      return msg.reply(`You didn't provide any arguments`);
    }
    const answers = require('../../data/gamesdata/8ball.json');
    const answer = answers.response[Math.floor(Math.random() * Math.floor(answers.response.length))];
    const embedMsg = new Discord.MessageEmbed()
      .setColor('#f0568a')
      .addField(`❓ Question`, question)
      .addField('💬 Answer', answer)
      .setFooter(`${msg.author.tag}`);

    msg.say(embedMsg);
  }

};
