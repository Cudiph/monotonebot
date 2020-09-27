const Discord = require('discord.js');
const { Command } = require('discord.js-commando');

module.exports = class MeowCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ping',
      aliases: ['p'],
      group: 'events',
      memberName: 'ping',
      description: 'Checks the bot\'s latency to the Discord server.',
      throttling: {
        usages: 5,
        duration: 10,
      },
    });
  }

  async run(message) {
    message.channel.send("Pinging...").then(pingMsg => {
      // Basic embed
      const embed = new Discord.MessageEmbed()
        .setColor("#11ff00")
        .setDescription(`Pong! 🏓`)
        .addFields(
          { name: `RTT Ping`, value: `${(pingMsg.editedTimestamp || pingMsg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp)}ms.`, inline: true},
          { name: `HB Ping`, value: `${Math.round(this.client.ws.ping)}ms.`, inline: true},
        )
        .setFooter(`Region: ${message.guild.region}`, message.guild.iconURL())

      // Then It Edits the message with the ping variable embed that you created
      pingMsg.delete();
      message.channel.send(embed);
    });
  }
};
