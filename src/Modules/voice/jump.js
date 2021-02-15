const { oneLine } = require('common-tags');
const { Command } = require('discord.js-commando');
const { play } = require('../../library/helper/player.js');


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
    // return if not connected
    if (!msg.guild.me.voice.connection) return;

    if (msg.guild.loop) msg.guild.indexQueue += numberToJump;
    else msg.guild.indexQueue += numberToJump - 1;

    if (msg.guild.me.voice.connection.dispatcher && msg.guild.me.voice.connection.dispatcher.paused) {
      msg.guild.indexQueue++;
      return play(msg);
    } else if (msg.guild.me.voice.connection.dispatcher) {
      msg.guild.me.voice.connection.dispatcher.end();
      return;
    }

    msg.guild.indexQueue++;
    play(msg);

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
