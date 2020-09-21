const Discord = require('discord.js');

module.exports = {
  name: '8ball',
  description: 'Ask anything to 8ball',
  usage: '<question>',
  args: true,
  execute(message, args) {
    if (!args.length) {
      return message.reply(`You didn't provide any arguments`);
    }
    const answers = require('../../data/gamesdata/8ball.json');
    const answer = answers.response[Math.floor(Math.random() * Math.floor(answers.response.length))]
    const embedMsg = new Discord.MessageEmbed()
      .setColor('#f0568a')
      .addField(`:question: Question`, args.join(' '))
      .addField(':speech_balloon: Answer', answer)
      .setFooter(`${message.author.username}#${message.author.discriminator}`)

    message.channel.send(embedMsg);
  }
}