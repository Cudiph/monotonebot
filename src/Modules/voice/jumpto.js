const { oneLine } = require('common-tags');
const Command = require('../../structures/Command.js');

// based on jump.js
module.exports = class JumpToCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'jumpto',
      aliases: ['skipto'],
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

  /** @param {import('discord.js-commando').CommandoMessage} msg */
  async run(msg, { indexToPlay }) {
    const player = this.client.lavaku.getPlayer(msg.guild.id);
    if (!player) return;

    if (indexToPlay < 0 || indexToPlay >= msg.guild.queue.length) {
      return msg.say(`Current total queue is 0-${msg.guild.queue.length - 1}`);
    }

    if (msg.guild.loop) msg.guild.indexQueue = ++indexToPlay;
    else msg.guild.indexQueue = indexToPlay;

    msg.guild.indexQueue -= 1;
    player.stopTrack();
    return;

  }

};
