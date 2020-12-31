const Discord = require('discord.js');
const { Command } = require('discord.js-commando');

module.exports = class PingCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ping',
      aliases: ['p'],
      group: 'util',
      memberName: 'ping',
      description: 'Show HeartBeat and Round-Trip Time latency',
      throttling: {
        usages: 3,
        duration: 10,
      },
    });
  }

  /** @param {import('discord.js-commando').CommandoMessage} msg */
  async run(msg) {
    const pingMsg = await msg.say("Pinging...");
    // Basic embed
    const rtt = (pingMsg.editedTimestamp || pingMsg.createdTimestamp) - (msg.editedTimestamp || msg.createdTimestamp);
    const hb = Math.round(this.client.ws.ping);
    const embed = new Discord.MessageEmbed()
      .setDescription(`Pong! 🏓`)
      .addFields(
        { name: `RTT Ping`, value: `**${rtt}**ms.`, inline: true },
        { name: `HB Ping`, value: `**${hb}**ms.`, inline: true },
      );
    if (msg.guild) {
      embed.setFooter(`Region: ${msg.guild.region}`, msg.guild.iconURL());
    } else if (msg.channel.type === 'dm') {
      embed.setFooter(`${msg.author.username}#${msg.author.discriminator}`, msg.author.displayAvatarURL());
    }

    // set embed color based on average of ping
    if (rtt + hb / 2 < 250) {
      embed.setColor('#11ff00');
    } else if (rtt + hb / 2 < 500) {
      embed.setColor('#ff9900');
    } else {
      embed.setColor('#ff0000');
    }

    // Then It Edits the msg with the ping variable embed that you created
    pingMsg.delete();
    msg.say(embed);
    return null;
  }
};
