const { oneLine } = require('common-tags');
const Command = require('../../structures/Command.js');


module.exports = class JumpCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'jump',
      group: 'voice',
      memberName: 'jump',
      aliases: ['skip'],
      description: 'Relatively jump to index of track queue (it is a skip)',
      examples: ['jump', 'skip', 'jump 2', 'skip -1'],
      guildOnly: true,
      details: oneLine`
      Jump to an index relatively if current playing track
      is #3 and you put \`..skip 2\`, it means you're playing
      track #5. Put a dash (-) before number if you want to go backward.
      `,
      throttling: {
        usages: 2,
        duration: 10,
      },
      args: [
        {
          key: 'numberToJump',
          prompt: 'How many track do you want to jump? (use negative value for backward, 0 to restart)',
          type: 'integer',
          default: 1,
        },
      ],
    });
  }

  /** @param {import('discord.js-commando').CommandoMessage} msg */
  async run(msg, { numberToJump }) {
    const player = this.client.lavaku.getPlayer(msg.guild.id);
    // return if not connected
    if (!player) return;

    if (msg.guild.loop) msg.guild.indexQueue += numberToJump;
    else msg.guild.indexQueue += numberToJump - 1;

    if (player) {
      player.stopTrack();
    }

  }

};
