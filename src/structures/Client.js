const { CommandoClient } = require('discord.js-commando');
const { Shoukaku } = require('shoukaku');
require('./Message.js');
require('./Guild.js');

const lavalinkServer = [
  {
    name: 'lavaku',
    host: process.env.LAVA_HOST || '127.0.0.1',
    port: 2333,
    auth: process.env.LAVA_PASS || 'youshallnotpass'
  }
];


class MonoClient extends CommandoClient {
  constructor(options = {}) {
    super(options);

    /**
     * Cached translated text, mapped like `${lang code}-${first word}-${word.length)`
     * @type {Map<string, string>}
     */
    this.langCache = new Map();

    /**
     * Shoukaku class
     * @type {Shoukaku}
     */
    this.lavaku = new Shoukaku(this, lavalinkServer, {
      reconnectTries: 1000,
      restTimeout: 20000,
      reconnectInterval: 5000,
    });
  }

  login(token) {
    this._setup();
    return super.login(token);
  }

  _setup() {
    this.lavaku.on('ready', (name) => logger.info(`Lavalink ${name}: Ready!`));
    this.lavaku.on('error', (name, error) => logger.error(`Lavalink ${name}: Error Caught,`, error));
    this.lavaku.on('close', (name, code, reason) => logger.warn(`Lavalink ${name}: Closed, Code ${code}, Reason ${reason || 'No reason'}`));
    this.lavaku.on('disconnected', (name, reason) => logger.warn(`Lavalink ${name}: Disconnected, Reason ${reason || 'No reason'}`));
  }
}

module.exports = MonoClient;
