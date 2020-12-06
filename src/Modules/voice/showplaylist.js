const { Command } = require('discord.js-commando');
const { stripIndents, oneLine } = require('common-tags');
const { userDataSchema } = require('../../library/Database/schema.js');
const { randomHex } = require('../../library/helper/discord-item.js');
const { emoji } = require('../../library/helper/discord-item.js');


// copied from setEmbedQueue
function setEmbedPlaylist(data, indexPage, page, msg, itemsPerPage) {
  const listLength = data.userPlaylists.length;
  let embed = {
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
  }

  if (page === Math.floor(listLength / itemsPerPage)) {
    for (let i = indexPage; i < listLength; i++) {
      const trackCount = data.userPlaylists[i].videoList.length;
      embed.description += stripIndents`
        \`\`\`yaml
        Name  : '${data.userPlaylists[i].name}'
        Desc  : ${data.userPlaylists[i].description}
        Index : ${i}
        Total : ${trackCount} ${trackCount > 1 ? 'Tracks' : 'Track'} 
        Created At  : ${data.userPlaylists[i].timestamps.toUTCString()}
        \`\`\`
        `;
    }
  } else {
    for (let i = indexPage; i < (indexPage + itemsPerPage); i++) {
      const trackCount = data.userPlaylists[i].videoList.length;
      embed.description += stripIndents`
        \`\`\`yaml
        Name  : '${data.userPlaylists[i].name}'
        Desc  : ${data.userPlaylists[i].description}
        Index : ${i}
        Total : ${trackCount} ${trackCount > 1 ? 'Tracks' : 'Track'} 
        Created At : ${data.userPlaylists[i].timestamps.toUTCString()}
        \`\`\`
        `;
    }
  }
  return embed;
}

module.exports = class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'showplaylist',
      group: 'voice',
      aliases: ['showpl'],
      memberName: 'showplaylist',
      description: 'Show playlist from database',
      guildOnly: true,
      throttling: {
        usages: 3,
        duration: 60,
      },
      args: [
        {
          key: 'itemsPerPage',
          prompt: 'How many track per page do you want to show?',
          type: 'integer',
          default: 5,
          min: 2,
          max: 7,
        }
      ]
    })
  }

  // copied from queue.js
  async run(msg, { itemsPerPage }) {
    // variabel to store data :)
    let page = 0;
    let index = 0;
    let data;
    let playlist;

    try {
      data = await userDataSchema.findOne({ id: msg.author.id });
      playlist = data.userPlaylists;
      if (!playlist.length) {
        throw 'user playlist is null';
      }
    } catch (e) {
      return msg.say(oneLine`
      Can't fetch playlists. Please create a new one if
      you don't have any playlist.
      `)
    }
    // send embed
    msg.say({ embed: setEmbedPlaylist(data, index, page, msg, itemsPerPage) })
      .then(async embedMsg => {
        let emojiNeeded = ['⬅', '➡', '🇽'];

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
            if (page + 1 > Math.ceil(playlist.length / itemsPerPage)) {
              page = (Math.ceil(playlist.length / itemsPerPage)) - 1;
              index -= itemsPerPage;
              return;
            }
          }
          if (collected.emoji.name === '➡' || collected.emoji.name === '⬅') {
            return embedMsg.edit({ embed: setEmbedPlaylist(data, index, page, msg, itemsPerPage) });
          }

        })

        // reacting the message
        if ((page + 1) !== Math.ceil(playlist.length / itemsPerPage)) {
          for (let i = 0; i < emojiNeeded.length; i++) {
            await embedMsg.react(emojiNeeded[i]);
          }
        } else {
          embedMsg.react(emoji.x);
        }
      })
  }

}

