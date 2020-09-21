const {
  getUserMention
} = require('../../library/users/getUser.js')

module.exports = {
  name: 'avatar',
  description: 'Show your avatar or someone avatar',
  guildOnly: true,
  execute(message, args) {
    const users = getUserMention(args[0], message);
    if (!args[0]) {
      message.channel.send(message.author.displayAvatarURL());
      return;
    } else if (users) {
      message.channel.send(users.user.displayAvatarURL());
      return;
    } else {
      message.channel.send('Invalid Arguments')
    }

  }
}