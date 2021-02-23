const { Command } = require('discord.js-commando');

class MonoCommand extends Command {
  onBlock(msg, reason, data) {
    super.onBlock(msg, reason, data)
      .then(blockMsg => blockMsg.delete({ timeout: 10000 }))
      .catch(e => e);
  }
}

module.exports = MonoCommand;
