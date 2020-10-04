const { Command } = require('discord.js-commando');

module.exports = class LeaveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'leave',
      group: 'voice',
      memberName: 'leave',
      description: 'leave voice channel',
      examples: ['leave'],
      guildOnly: true,
    })
  }

  async run(msg) {
    if (!msg.member.voice.channel || msg.member.voice.channel.id !== msg.guild.me.voice.channel.id) {
      // send msg if author not connected to the same voice channel
      return msg.channel.send("You must join to my voice channel");
    }
    delete msg.guild.queue;
    delete msg.guild.playedQueue;
    // leave the channel
    return await msg.member.voice.channel.leave();
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
