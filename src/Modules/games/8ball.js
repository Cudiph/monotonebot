const Discord = require('discord.js');
const { Command } = require('discord.js-commando');

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
    })
  }

  async run(msg, {question}) {
    if (!question.length) {
      return msg.reply(`You didn't provide any arguments`);
    }
    const answers = require('../../data/gamesdata/8ball.json');
    const answer = answers.response[Math.floor(Math.random() * Math.floor(answers.response.length))]
    const embedMsg = new Discord.MessageEmbed()
      .setColor('#f0568a')
      .addField(`:question: Question`, question)
      .addField(':speech_balloon: Answer', answer)
      .setFooter(`${msg.author.username}#${msg.author.discriminator}`)

    msg.channel.send(embedMsg);
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
