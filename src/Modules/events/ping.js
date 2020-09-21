const Discord = require('discord.js');

module.exports = {
  name: "ping",
  cooldown: 7,
  description: "Another one",
  execute(message, args) {
    message.channel.send("Pinging...").then(msg => {
      // The math thingy to calculate the user's ping
      let ping = msg.createdTimestamp - message.createdTimestamp;
      // Basic embed
      const embed = new Discord.MessageEmbed()
        .setDescription(`Your ping is **${ping}**ms`)
        .setColor("#11ff00")

      // Then It Edits the message with the ping variable embed that you created
      msg.delete();
      message.channel.send(embed)
    });
  }
}