const { Command } = require('discord.js-commando');

module.exports = class StopCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'stop',
      group: 'voice',
      memberName: 'stop',
      description: 'Stop current Track and clear the queue',
      examples: ['stop'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 10,
      },
    })
  }

  async run(msg) {
    if (!msg.guild.me.voice.connection) {
      return msg.say(`I'm not connected to the voice channel`);
    }

    if (msg.guild.me.voice.connection.dispatcher) {
      msg.guild.me.voice.connection.dispatcher.end();
    }
    delete msg.guild.queue;
    delete msg.guild.playedQueue;
  }

  async onBlock(msg, reason, data) {
    let parent = await super.onBlock(msg, reason, data);
    parent.delete({ timeout: 9000 });
  }

  onError(err, message, args, fromPattern, result) {
    super.onError(err, message, args, fromPattern, result)
      .then(msgParent => msgParent.delete({ timeout: 9000 }));
  }
}
