const { oneLine } = require('common-tags');
const { Command } = require('discord.js-commando');
const { play } = require('../../library/helper/player.js');

// based on jump.js
module.exports = class JumpToCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'jumpto',
      group: 'voice',
      memberName: 'jumpto',
      description: 'Jump to an index',
      examples: ['jumpto 2'],
      guildOnly: true,
      details: oneLine`
      Move to a track in absolute way. If your current track is #5 and you put
      \`..jumpto 3\` then it'll play the track #3.
      `,
      throttling: {
        usages: 2,
        duration: 10,
      },
      args: [
        {
          key: 'indexToPlay',
          prompt: 'What the index of the track do you want to play?',
          type: 'integer',
        },
      ],
    });
  }

  /** @param {import('discord.js-commando').CommandoMessage} message */
  async run(msg, { indexToPlay }) {
    if (!msg.guild.me.voice.connection) {
      return;
    }
    if (indexToPlay < 0 || indexToPlay >= msg.guild.queue.length) {
      return msg.say(`Current total queue is 0-${msg.guild.queue.length - 1}`);
    }
    msg.guild.indexQueue = indexToPlay;
    if (msg.guild.me.voice.connection.dispatcher && msg.guild.me.voice.connection.dispatcher.paused) {
      return play(msg);
    } else if (msg.guild.me.voice.connection.dispatcher) {
      msg.guild.indexQueue -= 1;
      msg.guild.me.voice.connection.dispatcher.end();
      return;
    }
    return play(msg);

  }

};
