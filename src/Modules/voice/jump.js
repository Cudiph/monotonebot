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
      description: 'Jump to index of track queue',
      examples: ['jump', 'skip', 'jump 2', 'skip -1'],
      guildOnly: true,
      argsType: 'multiple',
      details: oneLine`It's like skip but you can skip backward (using negatif value).
      In short it's like leaderboard`,
      throttling: {
        usages: 1,
        duration: 10,
      },
    })
  }

  async run(msg, args) {
    // return if not connected
    if (!msg.guild.me.voice.connection) {
      return;
    }
    // check if args is number or nah
    if (args.length && isNaN(args[0])) {
      return msg.say('argument must be a number');
    }
    let intArg;
    let rangeIndex = msg.guild.queue.length - msg.guild.indexQueue; //

    // set default args to 1
    if (!args.length) {
      intArg = 1;
    } else {
      intArg = parseInt(args[0]);
    }

    // check if arg exceed the queue length and set to 1 if true
    if (intArg > rangeIndex) {
      intArg = rangeIndex;
    }

    if (msg.guild.me.voice.connection.dispatcher) {
      await msg.guild.me.voice.connection.dispatcher.pause();
    }

    msg.guild.indexQueue += intArg;
    return play(msg);

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
