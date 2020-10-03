const ytdl = require('ytdl-core-discord');
const yts = require('yt-search');
const Discord = require('discord.js');
const emoji = require('../../library/helper/emoji.js');
const { Command } = require('discord.js-commando');
const { oneLine } = require('common-tags');


async function play(message) {
  let queue = message.guild.queue;

  // if queue is null then delete the object property in cache variable
  if (!queue) {
    message.channel.send(`Stopped Playing...`);
    return delete guildQueue[guildId];
  }

  const connection = await message.member.voice.channel.join();
  // make a stream dispatcher
  let dispatcher = await connection.play(await ytdl(guildQueue[guildId][0].link), { type: 'opus', filter: 'audioonly', volume: 0.5 });

  guildQueue[guildId][0].dispatcher = dispatcher;

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

function setEmbed(dataList, indexPage, page, msg, itemsPerPage) {
  let listLength = dataList.length;
  let embed = {
    color: 0x53bcfc,
    author: {
      name: `@${msg.author.username}#${msg.author.discriminator}`,
      icon_url: msg.author.displayAvatarURL(),
    },
    description: `React with emoji to select audio`,
    fields: [],
    footer: {
      text: `${page + 1}/${Math.ceil(listLength / itemsPerPage)}`,
    },
  }

  if ((page + 1) === Math.ceil(listLength / itemsPerPage)) {
    for (let i = 0; i < (listLength - indexPage); i++) {
      embed.fields.push({
        name: `[${i + 1}] ${dataList[indexPage + i].title}`,
        value: `Uploaded by ${dataList[indexPage + i].author.name} | ${dataList[indexPage + i].timestamp}`,
      })
    }
  } else {
    for (let i = 0; i < itemsPerPage; i++) {
      embed.fields.push({
        name: `[${i + 1}] ${dataList[indexPage + i].title}`,
        value: `Uploaded by ${dataList[indexPage + i].author.name} | ${dataList[indexPage + i].timestamp}`,
      })
    }
  }

  return embed;
}

module.exports = class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'play',
      group: 'voice',
      memberName: 'play',
      description: 'Play audio from youtube',
      examples: ['play Despacito 2', 'play https://www.youtube.com/watch?v=D3dB3eflo1'],
      argsType: 'multiple',
      guildOnly: true,
      details: oneLine`
      Play audio from youtube. You can play with query or with a link in
      argument.
      `,
      throttling: {
        usages: 3,
        duration: 10,
      },
      clientPermissions: ['CONNECT', 'SPEAK'],
    })
  }

  async run(message, args) {
    // if not in voice channel
    if (!message.member.voice.channel) {
      // send message if author not connected to voice channel
      return message.channel.send("You're not connected to any voice channel");
    }

    if (message.member.voice.channel) {
      const link = args[0].match(/https?:\/\/www.youtube.com\/watch\?v=\w+/)

      // check if author send a youtube link
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

      let { videos } = await yts(args.join(' '))

      let page = 0; // for page
      let music = 0; // for choosing music index
      let itemsPerPage = 5; // set items showed per page

      let Embed = setEmbed(videos, music, page, message, itemsPerPage);

      message.channel.send({embed: Embed}).then(async msg => {
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
            music -= itemsPerPage;
            if (page < 0) {
              page = 0;
              music = 0;
              return;
            }
          } else if (collected.emoji.name === '➡') {
            // increment index for list
            page++;
            music += itemsPerPage;
            // when page exceed the max of video length
            if (page + 1 > Math.ceil(videos.length / itemsPerPage)) {
              page = (Math.ceil(videos.length / itemsPerPage)) - 1;
              music -= itemsPerPage;
              return;
            }
          }
          if (collected.emoji.name === '➡' || collected.emoji.name === '⬅') {
            let embed2 = setEmbed(videos, music, page, message, itemsPerPage);

            return msg.edit({embed: embed2});
          }

          if (collected.emoji.name === emoji[1]) {
            let data = videos[music];
            msg.edit(`${data.title} has been added to the queue.`).then(msg => {
              msg.delete();
            })
            return player(data, message);
          } else if (collected.emoji.name === emoji[2]) {
            let data = videos[music + 1];
            msg.edit(`${data.title} has been added to the queue.`).then(msg => {
              msg.delete();
            })
            return player(data, message);
          } else if (collected.emoji.name === emoji[3]) {
            let data = videos[music + 2];
            msg.edit(`${data.title} has been added to the queue.`).then(msg => {
              msg.delete();
            })
            return player(data, message);
          } else if (collected.emoji.name === emoji[4]) {
            let data = videos[music + 3];
            msg.edit(`${data.title} has been added to the queue.`).then(msg => {
              msg.delete();
            })
            return player(data, message);
          } else if (collected.emoji.name === emoji[5]) {
            let data = videos[music + 4];
            msg.edit(`${data.title} has been added to the queue.`).then(msg => {
              msg.delete();
            })
            return player(data, message);
          }
        })
      })

    }

  }

  async onBlock(msg, reason, data) {
    let parent = await super.onBlock(msg, reason, data);
    parent.delete({ timeout: 9000 })
  }

  onError(err, message, args, fromPattern, result) {
    super.onError(err, message, args, fromPattern, result)
      .then(msgParent => msgParent.delete({ timeout: 9000 }));
  }
}

