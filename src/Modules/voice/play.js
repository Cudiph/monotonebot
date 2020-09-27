const ytdl = require('ytdl-core-discord');
const fetch = require('node-fetch');
const Discord = require('discord.js');
const emoji = require('../../library/helper/emoji.js');

async function play(message) {
  const guildId = message.guild.id;

  // if queue is null then delete the object property in cache variable
  if (!guildQueue[guildId]) {
    message.channel.send(`Stopped Playing...`);
    return delete guildQueue[guildId];
  }
  console.log('halt 1');

  const connection = await message.member.voice.channel.join();
  // make a stream dispatcher
  let dispatcher = await connection.play(await ytdl(guildQueue[guildId][0].link), { type: 'opus', filter: 'audioonly', volume: 0.5 });

  guildQueue[guildId][0].dispatcher = dispatcher;

  console.log('halt 2');

  connection.on('disconnect', () => {
    delete guildQueue[guildId];
  })

  dispatcher.on('start', () => {
    message.channel.send('now playing\n' + guildQueue[guildId][0].title + ` by ${guildQueue[guildId][0].uploader}`);
  });

  dispatcher.on('finish', () => {
    guildQueue[guildId].shift();
    play(message)
  });

  dispatcher.on('error', err => logger.log('error', err));
}
async function player(data, message) {
  const guildId = message.guild.id;
  if (!guildQueue[guildId]) {
    try {
      const construction = {
        title: data.title,
        link: data.uri,
        uploader: data.author.name,
        channel: message.channel
      }
      guildQueue[guildId] = [];
      await guildQueue[guildId].push(construction);
      return play(message);
    } catch (err) {
      delete guildQueue[guildId];
      logger.log('error', err);
    }
  } else {
    const construction = {
      title: data.title,
      link: data.uri,
      uploader: data.author.name,
      channel: message.channel
    }
    guildQueue[guildId].push(construction);
    return message.channel.send(`${data.title} has been added to the queue.`)
  }


}

module.exports = {
  name: 'play',
  description: 'Play music',
  usage: '<query|link>',
  guildOnly: true,
  args: true,
  async execute(message, args) {
    // if not in voice channel
    if (!message.member.voice.channel) {
      // send message if author not connected to voice channel
      return message.channel.send("You're not connected to any voice channel");
    }
    // if the bot doesn't have required permission
    if (!message.guild.me.hasPermission(["CONNECT", "SPEAK"])) {
      return message.channel.send("I don't have permissions to use voice channel");
    }
    // if member in voice channel
    // I think this is useless
    if (message.member.voice.channel) {
      const link = args[0].match(/https?:\/\/www.youtube.com\/watch\?v=\w+/)
      if (link) {
        let data = ytdl.getInfo(args[0])
        let dataConstructor = {
          title: data.title,
          uri: args[0],
          author: { name: data.author },
          channel: message.channel
        }
        return player(dataConstructor, message);
      }
      // emoji database and google api key
      // make  a query

      const { result } = await fetch(`https://ytapi.cf/search/${args.join('+')}}`)
        .then(response => response.json());

      let page = 0; // for page
      let music = 0; // for choosing music index

      let Embed = new Discord.MessageEmbed()
        .setColor('#53bcfc')
        .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
        .setDescription(`React with emoji to select audio`)
        .addFields(
          { name: `[1] ${result[music].title}`, value: `Uploaded by ${result[music].author.name}` },
          { name: `[2] ${result[music + 1].title}`, value: `Uploaded by ${result[music + 1].author.name}` },
          { name: `[3] ${result[music + 2].title}`, value: `Uploaded by ${result[music + 2].author.name}` },
          { name: `[4] ${result[music + 3].title}`, value: `Uploaded by ${result[music + 3].author.name}` },
          { name: `[5] ${result[music + 4].title}`, value: `Uploaded by ${result[music + 4].author.name}` },
        )
        .setFooter(`${page + 1}/${Math.floor(result.length / 5)}`);

      message.channel.send(Embed).then(async msg => {
          msg.react(emoji[1]);
          msg.react(emoji[2]);
          msg.react(emoji[3]);
          msg.react(emoji[4]);
          msg.react(emoji[5]);
          msg.react(emoji.leftA);
          msg.react(emoji.rightA);
          msg.react(emoji.x);

        const filter = (reaction, user) => {
          return [emoji[1], emoji[2], emoji[3], emoji[4], emoji[5], emoji.leftA, emoji.rightA, emoji.x]
            .includes(reaction.emoji.name) && user.id === message.author.id;
        };
        const collector = msg.createReactionCollector(filter, { time: 60000, dispose: true });

        collector.on('collect', async collected => {
          if (collected.emoji.name === emoji.x) {
            msg.delete();
          } else if (collected.emoji.name === '⬅') {
            // decrement index for list
            page--;
            music -= 5;
            if (page < 0) {
              page = 0;
              music = 0;
              return;
            }
          } else if (collected.emoji.name === '➡') {
            // increment index for list
            page++;
            music += 5;
            if (page + 1 > result.length / 5) {
              page = (Math.floor(result.length / 5)) - 1;
              music = (Math.floor(result.length / 5) * 5) - 5;
              return;
            }
          }
          if (collected.emoji.name === '➡' || collected.emoji.name === '⬅') {
            var embed2 = new Discord.MessageEmbed()
              .setColor('#53bcfc')
              .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
              .setDescription(`React with emoji to select audio`)
              .addFields(
                { name: `[1] ${result[music].title}`, value: `Uploaded by ${result[music].author.name}` },
                { name: `[2] ${result[music + 1].title}`, value: `Uploaded by ${result[music + 1].author.name}` },
                { name: `[3] ${result[music + 2].title}`, value: `Uploaded by ${result[music + 2].author.name}` },
                { name: `[4] ${result[music + 3].title}`, value: `Uploaded by ${result[music + 3].author.name}` },
                { name: `[5] ${result[music + 4].title}`, value: `Uploaded by ${result[music + 4].author.name}` },
              )
              .setFooter(`${page + 1}/${Math.floor(result.length / 5)}`);

            return msg.edit(embed2);
          }

          if (collected.emoji.name === emoji[1]) {
            let data = result[music];
            msg.edit(`${data.title} has been added to the queue.`).then(msg => {
              msg.delete();
            })
            return player(data, message);
          } else if (collected.emoji.name === emoji[2]) {
            let data = result[music + 1];
            msg.edit(`${data.title} has been added to the queue.`).then(msg => {
              msg.delete();
            })
            return player(data, message);
          } else if (collected.emoji.name === emoji[3]) {
            let data = result[music + 2];
            msg.edit(`${data.title} has been added to the queue.`).then(msg => {
              msg.delete();
            })
            return player(data, message);
          } else if (collected.emoji.name === emoji[4]) {
            let data = result[music + 3];
            msg.edit(`${data.title} has been added to the queue.`).then(msg => {
              msg.delete();
            })
            return player(data, message);
          } else if (collected.emoji.name === emoji[5]) {
            let data = result[music + 4];
            msg.edit(`${data.title} has been added to the queue.`).then(msg => {
              msg.delete();
            })
            return player(data, message);
          }
        })
      })

    }

  }

}
