const Command = require('../../structures/Command.js');

module.exports = class SetNicknameCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'setnickname',
      aliases: ['setnick'],
      group: 'administration',
      memberName: 'setnickname',
      description: 'set someone\'s nickname',
      examples: ['setnickname @john nsfw master', 'setnick 724114678258729031'],
      guarded: true,
      userPermissions: ['MANAGE_NICKNAMES'],
      clientPermissions: ['CHANGE_NICKNAME', 'MANAGE_NICKNAMES'],
      args: [
        {
          key: 'member',
          prompt: 'Which user you want to rename?',
          type: 'member',
        },
        {
          key: 'newNick',
          prompt: 'New nickname of the user. ("none" to delete nickname)',
          type: 'string',
          default: "none",
          min: 2,
          max: 32,
        }
      ],
    });
  }

  /** @param {import('discord.js-commando').CommandoMessage} msg */
  async run(msg, { member, newNick }) {
    // // old method
    // let member = await isUserId(args[0], msg);
    // let isMember = args[0].match(/^<@!?\d+>$/);
    // // check if the member is exist
    // if (member) {
    //   member = await msg.guild.members.cache.get(args[0]);
    // } else if (isMember) {
    //   member = await getUserMention(args[0], msg);
    // } else {
    //   return msg.say('Invalid Id or Argument');
    // }
    newNick = newNick == 'none' || !newNick ? '' : newNick;
    member.setNickname(newNick)
      .then(() => msg.say('Nickname succesfully changed'))
      .catch(err => {
        logger.error(err.stack);
        return msg.say('An error occured, possibly because missing permission').then(resMsg => resMsg.delete({ timeout: 6000 }));
      });
  }

};

