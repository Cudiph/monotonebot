const Command = require('../../structures/Command.js');

module.exports = class StopCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'stop',
      group: 'voice',
      memberName: 'stop',
      description: 'Stop current Track and move to the end of queue',
      examples: ['stop'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 10,
      },
      args: [
        {
          key: 'deleteQueue',
          label: 'DeleteQueue?',
          prompt: 'Delete the queue?',
          type: 'boolean',
          default: false,
        }
      ]
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg, { deleteQueue }) {
    if (!msg.guild.me.voice.connection) {
      return msg.say(`I'm not connected to the voice channel`);
    }

    if (msg.guild.me.voice.connection.dispatcher) {
      msg.guild.indexQueue = msg.guild.queue.length;
      msg.guild.autoplay = false;
      msg.guild.loop = false;
      msg.guild.loopQueue = false;
      msg.guild.me.voice.connection.dispatcher.end();
    }

    if (deleteQueue) {
      delete msg.guild.queue;
      delete msg.guild.queueTemp;
    }
  }

};
