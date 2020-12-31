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
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg) {
    if (!msg.guild.me.voice.channel) {
      return;
    }

    if (!msg.member.voice.channel || msg.member.voice.channel.id !== msg.guild.me.voice.channel.id) {
      // send msg if author not connected to the same voice channel
      return msg.reply("You must join to my voice channel");
    }

    // delete queue
    delete msg.guild.queue;
    delete msg.guild.playedQueue;
    msg.guild.autoplay = false;
    msg.guild.loop = false;
    // leave the channel
    return await msg.member.voice.channel.leave();
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
