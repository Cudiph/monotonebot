const { CommandoClient } = require('discord.js-commando');
require('./Message.js');
require('./Guild.js');

class MonoClient extends CommandoClient {
  constructor(options = {}) {
    super(options);

    /**
     * Cached translated text, mapped like `${lang code}-${first word}-${word.length)`
     * @type {Map<string, string>}
     */
    this.langCache = new Map();
  }
}

module.exports = MonoClient;
