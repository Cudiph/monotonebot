const Discord = require('discord.js');
const { Command } = require('discord.js-commando');

module.exports = class PingCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ping',
      aliases: ['p'],
      group: 'util',
      memberName: 'ping',
      description: 'Checks the bot\'s latency to the Discord server.',
      throttling: {
        usages: 5,
        duration: 10,
      },
    });
  }

  async run(msg) {
    msg.channel.send("Pinging...").then(pingMsg => {
      // Basic embed
      const embed = new Discord.MessageEmbed()
        .setColor("#11ff00")
        .setDescription(`Pong! 🏓`)
        .addFields(
          { name: `RTT Ping`, value: `${(pingMsg.editedTimestamp || pingMsg.createdTimestamp) - (msg.editedTimestamp || msg.createdTimestamp)}ms.`, inline: true},
          { name: `HB Ping`, value: `${Math.round(this.client.ws.ping)}ms.`, inline: true},
        )
        if (msg.guild) {
          embed.setFooter(`Region: ${msg.guild.region}`, msg.guild.iconURL());
        } else if (msg.channel.type === 'dm') {
          embed.setFooter(`${msg.author.username}#${msg.author.discriminator}`, msg.author.displayAvatarURL())
        }

      // Then It Edits the msg with the ping variable embed that you created
      pingMsg.delete();
      msg.channel.send(embed);
    });
  }
};
