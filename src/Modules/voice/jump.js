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
      description: 'Jump to index of track queue (it is a skip)',
      examples: ['jump', 'skip', 'jump 2', 'skip -1'],
      guildOnly: true,
      details: oneLine`It's like skip but you can skip backward (using negatif value).
      In short it's like leaderboard`,
      throttling: {
        usages: 1,
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
    })
  }

  async run(msg, { numberToJump }) {
    // return if not connected
    if (!msg.guild.me.voice.connection) {
      return;
    }

    // idk why when this line is deleted and modify the msg.guild.indexQueue++ to
    // msg.guild.indexQueue += numberToJump
    // it can't go back nor jump using numberToJump
    // what a miracle lol
    msg.guild.indexQueue += numberToJump - 1;

    if (msg.guild.me.voice.connection.dispatcher) {
      return await msg.guild.me.voice.connection.dispatcher.end();
    } else {
      msg.guild.indexQueue++;
      return play(msg);
    }

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
