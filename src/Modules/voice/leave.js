module.exports = {
  name: 'leave',
  description: 'leave the voice channel',
  guildOnly: true,
  args: true,
  async execute(message, args) {
    if (!message.guild.me.voice.channel) {
      // if not connected then reply
      return message.reply(`I'm already disconnected from the voice channel`);
    }

    if (!message.member.voice.channel || message.member.voice.channel.id !== message.guild.me.voice.channel.id) {
      // send message if author not connected to the same voice channel
      return message.channel.send("You must join to my voice channel");
    }
    // leave the channel
    return await message.member.voice.channel.leave();
  }
}