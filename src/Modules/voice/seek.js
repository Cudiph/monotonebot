const Command = require('../../structures/Command.js');
const Util = require('../../util/Util');


/**
 *
 * @param {string[]} template A template of timeline
 * @param {CommandoMessage} msg
 * @returns {Object} embed
 */
function seekEmbed(template, msg) {
  const queue = msg.guild.queue;
  const indexQ = msg.guild.indexQueue;
  const seekTime = queue[indexQ].seekTime || 0;
  const currentTime = Math.floor(msg.guild.me.voice.connection.dispatcher.streamTime / 1000) + seekTime;
  let totalTime = 0;
  for (let i = 0; i < indexQ + 1; i++) {
    if (i == indexQ) {
      totalTime += currentTime;
      break;
    }
    totalTime += queue[i].seconds;
  }
  const embed = {
    color: parseInt(Util.randomHex(), 16),
    title: queue[indexQ].title,
    url: queue[indexQ].link,
    description: `${template.join('')} ${Util.toTimestamp(currentTime)} / ${Util.toTimestamp(queue[indexQ].seconds)}`,
    timestamp: new Date(),
    footer: {
      text: `Estimated time played is ${Util.toTimestamp(Math.floor(totalTime))}`,
    },
  };
  return embed;
}


module.exports = class SeekCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'seek',
      group: 'voice',
      memberName: 'seek',
      description: 'See current watch/listen time',
      examples: ['seek 1:20', 'seek 143'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 15,
      },
      clientPermissions: ['CONNECT', 'SPEAK'],
      args: [
        {
          key: 'timestamp',
          prompt: 'timestamp to move?',
          type: 'string',
          default: '',
        }
      ]
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg, { timestamp }) {
    // handler
    if (!msg.guild.me.voice.connection) {
      return;
    } else if (!msg.guild.me.voice.connection.dispatcher) {
      return msg.say('I\'m currently not playing any track');
    }

    // convert timestamp
    if (timestamp) {
      if (timestamp.includes(':')) {
        const timestampOnly = timestamp.replace(/\s+/g, '');
        timestamp = Util.toSeconds(timestampOnly);
      } else if (timestamp.match(/\d+/)) {
        const secondsOnly = timestamp.match(/\d+/);
        timestamp = parseInt(secondsOnly[0]);
      } else {
        return msg.reply('Please provide a correct format for the timestamp');
      }
    }


    const queue = msg.guild.queue;
    const indexQ = msg.guild.indexQueue;


    const songLength = queue[indexQ].seconds;
    if (timestamp) {
      // handler
      if (songLength <= timestamp) {
        return msg.reply(`Current track length is **${songLength}s** or **${Util.toTimestamp(songLength)}**`);
      } else if (songLength - 15 <= timestamp) {
        return msg.reply(`Please provide the time that isn't close to the end of the song`);
      } else if (timestamp < 0) {
        return msg.reply('Please provide a correct format for the timestamp');
      }

      if (timestamp > 600) {
        return msg.reply(`Currently seeking is support up to 10 minutes due to performance issue`);
      }

      msg.guild.play(msg, { seek: timestamp });
      return msg.say(`Playing **${queue[indexQ].title}** at **${Util.toTimestamp(timestamp)}**`);
    }

    const seekTime = queue[indexQ].seekTime ? queue[indexQ].seekTime : 0;
    const currentTime = Math.floor(msg.guild.me.voice.connection.dispatcher.streamTime / 1000) + seekTime;
    const percentage = currentTime / songLength * 100; // percentage of the time played
    const template = ['**', '**', '❥'];

    for (let i = 0; i < percentage / 2; i++) {
      template.splice(1, 0, '-');
    }
    for (let i = 0; i < (49 - percentage / 2); i++) {
      template.push('-');
    }

    return msg.embed(seekEmbed(template, msg));
  }

};

