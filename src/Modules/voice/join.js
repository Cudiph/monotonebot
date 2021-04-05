const Command = require('../../structures/Command.js');

module.exports = class JoinCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'join',
      group: 'voice',
      memberName: 'join',
      description: 'Join your current voice channel',
      examples: ['join'],
      guildOnly: true,
      clientPermissions: ['CONNECT'],
      throttling: {
        usages: 1,
        duration: 10,
      },
    });
  }

  /** @param {import('discord.js-commando').CommandoMessage} msg */
  async run(msg) {
    if (!msg.member.voice.channel) {
      // send message if author not connected to voice channel
      return msg.reply("You're not connected to any voice channel");
    }
    const node = this.client.lavaku.getNode();
    const player = await node.joinVoiceChannel({
      guildID: msg.guild.id,
      voiceChannelID: msg.member.voice.channelID,
    });

    // give data when dispatcher start
    player.on('start', async () => {
      const nowPlaying = await msg.sendEmbedPlaying().catch(e => e);
      // assign now playing embed message id to the queue object
      msg.guild.playingEmbedID = nowPlaying.id;
      msg.channel.stopTyping(true);
    });

    // play next song when current song is finished
    player.on('end', async (reason) => {
      if (reason.type !== 'TrackEndEvent') {
        msg.say(`An error occured. **Track #${msg.guild.indexQueue}** will be skipped`);
      }
      // delete the now playing embed when the track is finished
      await msg.channel.messages.delete(msg.guild.playingEmbedID).catch(e => e);
      msg.guild.indexQueue++;
      return msg.guild.play(msg);
    });

    // skip current track if error occured
    player.on('error', err => {
      msg.channel.stopTyping(true);
      logger.error(err);
      msg.say(`An error occured. **Track #${msg.guild.indexQueue}** will be skipped`);
      msg.guild.indexQueue++;
      return msg.guild.play(msg);
    });

    player.on('closed', () => {
      msg.channel.messages.delete(msg.guild.playingEmbedID).catch(e => e);
      msg.channel.stopTyping(true);
      msg.guild.resetPlayer();
      player.disconnect();
    });
  }

};
