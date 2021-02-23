const { Command } = require('discord.js-commando');
const { stripIndents, oneLine } = require('common-tags');
const { userDataSchema } = require('../../library/Database/schema.js');
const { randomHex } = require('../../library/helper/discord-item.js');
const { emoji, toTimestamp } = require('../../library/helper/discord-item.js');


// copied from setEmbedQueue
function setEmbedPlaylist(userPlaylists, indexPage, page, msg, itemsPerPage) {
  const listLength = userPlaylists.length;
  const embed = {
    color: parseInt(randomHex(), 16),
    author: {
      name: `Playlist of ${msg.author.username}#${msg.author.discriminator}`,
      icon_url: msg.author.displayAvatarURL(),
    },
    description: '',
    footer: {
      text: oneLine`
        ${page + 1}/${Math.ceil(listLength / itemsPerPage)}
        • Received ${listLength} ${listLength > 1 ? 'Playlists' : 'Playlist'}
      `,
    },
  };

  if (page === Math.floor(listLength / itemsPerPage)) {
    for (let i = indexPage; i < listLength; i++) {
      const trackCount = userPlaylists[i].videoList.length;
      embed.description += stripIndents`
        \`\`\`yaml
        Name  : '${userPlaylists[i].name}'
        Desc  : ${userPlaylists[i].description}
        Index : ${i}
        Total : ${trackCount} ${trackCount > 1 ? 'Tracks' : 'Track'} 
        Created At  : ${userPlaylists[i].timestamps.toUTCString()}
        \`\`\`
        `;
    }
  } else {
    for (let i = indexPage; i < (indexPage + itemsPerPage); i++) {
      const trackCount = userPlaylists[i].videoList.length;
      embed.description += stripIndents`
        \`\`\`yaml
        Name  : '${userPlaylists[i].name}'
        Desc  : ${userPlaylists[i].description}
        Index : ${i}
        Total : ${trackCount} ${trackCount > 1 ? 'Tracks' : 'Track'} 
        Created At : ${userPlaylists[i].timestamps.toUTCString()}
        \`\`\`
        `;
    }
  }
  return embed;
}


// copied from setEmbedQueue
function setEmbedPlaylistContent(playlist, indexPage, page, msg, itemsPerPage) {
  const listLength = playlist.videoList.length;
  const videoList = playlist.videoList;
  const embed = {
    color: parseInt(randomHex(), 16),
    title: `Content of **${playlist.name}*** playlist`,
    description: playlist.description,
    fields: [],
    timestamp: new Date(),
    footer: {
      text: `${page + 1}/${Math.ceil(listLength / itemsPerPage)}`,
    },
  };

  // if page is the last page then exec this code
  if (page === Math.floor(listLength / itemsPerPage)) {
    for (let i = indexPage; i < listLength; i++) {
      // add => sign to current playing
      if ((indexPage + i) !== msg.guild.indexQueue) {
        embed.fields.push({
          name: `[${i}] ${videoList[i].title}`,
          value: `${videoList[i].uploader} ${videoList[i].seconds ? '| ' + toTimestamp(videoList[i].seconds) : ''} | [YouTube](${videoList[i].link})`,
        });
      } else {
        embed.fields.push({
          name: `=> [${i}] ${videoList[i].title}`,
          value: `${videoList[i].uploader} ${videoList[i].seconds ? '| ' + toTimestamp(videoList[i].seconds) : ''} | [YouTube](${videoList[i].link})`,
        });
      }

    }
  } else {
    for (let i = indexPage; i < (indexPage + itemsPerPage); i++) {
      if ((indexPage) !== msg.guild.indexQueue) {
        embed.fields.push({
          name: `[${i}] ${videoList[i].title}`,
          value: `${videoList[i].uploader} ${videoList[i].seconds ? '| ' + toTimestamp(videoList[i].seconds) : ''} | [YouTube](${videoList[i].link})`,
        });
      } else {
        embed.fields.push({
          name: `=> [${i}] ${videoList[i].title}`,
          value: `${videoList[i].uploader} ${videoList[i].seconds ? '| ' + toTimestamp(videoList[i].seconds) : ''} | [YouTube](${videoList[i].link})`,
        });
      }
    }
  }
  let qlength = 0;
  videoList.forEach(obj => qlength += obj.seconds);

  embed.fields.push(
    {
      name: `Total Tracks`,
      value: `${listLength}`,
      inline: true,
    },
    {
      name: `Length`,
      value: `${toTimestamp(qlength)}`,
      inline: true,
    },
    {
      name: `Created At`,
      value: `${playlist.timestamps.toUTCString()}`,
      inline: true,
    },
  );

  return embed;
}


module.exports = class ShowPlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'showplaylist',
      group: 'voice',
      aliases: ['showpl'],
      examples: ['showpl', 'showpl 3'],
      memberName: 'showplaylist',
      description: 'Show playlist from database',
      details: oneLine`
        Show all the playlist information that you have saved.
        If you want to see the content or video list in a playlist, 
        you can use \`..showpl n\` where n is the index of your playlist.
      `,
      guildOnly: true,
      throttling: {
        usages: 3,
        duration: 60,
      },
      args: [
        {
          key: 'playlistId',
          prompt: 'Which playlist do you want to show it\'s content?',
          type: 'integer',
          default: '',
        }
      ]
    });
  }

  /** @param {import('discord.js-commando').CommandoMessage} msg */
  async run(msg, { playlistId }) {
    // variabel to store data :)
    let page = 0;
    let index = 0;
    let data;
    let playlist;
    let itemsPerPage = 5;

    try {
      data = await userDataSchema.findOne({ userId: msg.author.id });
      playlist = data.userPlaylists;
      if (!playlist.length) {
        throw 'user playlist is null';
      } else if (playlistId !== '' && playlistId < 0 || playlistId >= playlist.length) {
        return msg.say(`Your current playlist is from 0-${playlist.length - 1}`);
      }
    } catch (e) {
      return msg.say(oneLine`
      Can't fetch playlists. Please create a new one if
      you don't have any playlist.
      `);
    }

    let embed; // embed to send / update
    let list; // list of playlist or videoList
    let listLength; // length of list
    if (playlistId !== '') {
      itemsPerPage = 9;
      list = playlist[playlistId];
      listLength = list.videoList.length;
      embed = setEmbedPlaylistContent;
    } else {
      list = playlist;
      listLength = playlist.length;
      embed = setEmbedPlaylist;
    }

    // send embed
    msg.say({ embed: embed(list, index, page, msg, itemsPerPage) })
      .then(async embedMsg => {
        const emojiNeeded = ['⬅', '➡', '🇽'];

        const filter = (reaction, user) => {
          return emojiNeeded.includes(reaction.emoji.name) && user.id === msg.author.id;
        };

        const collector = embedMsg.createReactionCollector(filter, { time: 60000, dispose: true });

        collector.on('collect', async collected => {
          if (collected.emoji.name === emoji.x) {
            embedMsg.delete();
          } else if (collected.emoji.name === '⬅') {
            // decrement index for list
            page--;
            index -= itemsPerPage;
            if (page < 0) {
              page = 0;
              index = 0;
              return;
            }
          } else if (collected.emoji.name === '➡') {
            // increment index for list
            page++;
            index += itemsPerPage;
            // when page exceed the max of video length
            if (page + 1 > Math.ceil(listLength / itemsPerPage)) {
              page = (Math.ceil(listLength / itemsPerPage)) - 1;
              index -= itemsPerPage;
              return;
            }
          }
          if (collected.emoji.name === '➡' || collected.emoji.name === '⬅') {
            return embedMsg.edit({ embed: embed(list, index, page, msg, itemsPerPage) });
          }

        });

        // reacting the message
        if ((page + 1) !== Math.ceil(listLength / itemsPerPage)) {
          for (let i = 0; i < emojiNeeded.length; i++) {
            await embedMsg.react(emojiNeeded[i]);
          }
        } else {
          embedMsg.react(emoji.x);
        }
      });
  }

};

