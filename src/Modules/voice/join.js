const Command = require('../../structures/Command.js');

module.exports = class JoinCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'join',
      group: 'voice',
      memberName: 'join',
      description: 'Join your current voice channel',
      examples: ['join'],
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 10,
      },
    });
  }

  async run(msg) {
    if (!msg.member.voice.channel) {
      // send message if author not connected to voice channel
      return msg.reply("You're not connected to any voice channel");
    }
    await msg.member.voice.channel.join();
  }

};
