const { Command } = require('discord.js-commando');

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
        usages: 2,
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
