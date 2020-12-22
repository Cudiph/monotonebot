const Discord = require('discord.js');
const { Command } = require('discord.js-commando');
const { guildSettingsSchema } = require('../../library/Database/schema.js');
const { oneLine, stripIndents } = require('common-tags');
const { client } = require('../../bot.js');
const { sendtoLogChan } = require('../../library/helper/embed.js');

async function writePrefix(newPrefix, msg) {
  // set new prefix for guild
  try {
    let result = await guildSettingsSchema.findOneAndUpdate({ guildId: msg.guild.id }, {
      guildId: msg.guild.id,
      prefix: newPrefix,
    }, { upsert: true });
    if (result) return result.prefix; else return client.commandPrefix;
  } catch (err) {
    logger.log('error', err);
    msg.channel.send(`Can't update the prefix.`);
    return 'error';
  }
}

module.exports = class PrefixCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'prefix',
      group: 'administration',
      memberName: 'prefix',
      description: 'Shows or sets the command prefix.',
      format: '[prefix/"default"/"none"]',
      details: oneLine`
				If no prefix is provided, the current prefix will be shown.
				If the prefix is "default", the prefix will be reset to the bot's default prefix.
				If the prefix is "none", the prefix will be removed entirely, only allowing mentions to run commands.
				Only administrators may change the prefix.
			`,
      examples: ['prefix', 'prefix ?', 'prefix omg!', 'prefix default', 'prefix none'],

      args: [
        {
          key: 'prefix',
          prompt: 'What would you like to set the bot\'s prefix to?',
          type: 'string',
          max: 15,
          default: '',
        }
      ],
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR']
    });
  }

  /** @param {import("discord.js-commando").CommandoMessage} msg */
  async run(msg, args) {
    // Just output the prefix
    if (!args.prefix) {
      const prefix = msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix;
      return msg.reply(stripIndents`
				${prefix ? `The command prefix is \`\`${prefix}\`\`.` : 'There is no command prefix.'}
				To run commands, use ${msg.anyUsage('command')}.
			`);
    }

    // Check the user's permission before changing anything
    if (msg.guild) {
      if (!msg.member.hasPermission('ADMINISTRATOR') && !this.client.isOwner(msg.author)) {
        return msg.reply('Only administrators may change the command prefix.');
      }
    } else if (!this.client.isOwner(msg.author)) {
      return msg.reply('Only the bot owner(s) may change the global command prefix.');
    }

    // Save the prefix
    const lowercase = args.prefix.toLowerCase();
    const prefix = lowercase === 'none' ? '' : args.prefix;
    let response;
    if (lowercase === 'default') {
      if (msg.guild) msg.guild.commandPrefix = null; else this.client.commandPrefix = null;
      const current = this.client.commandPrefix ? `\`\`${this.client.commandPrefix}\`\`` : 'no prefix';
      response = `Reset the command prefix to the default (currently ${current}).`;
      msg.channel.send(response);
    } else {
      let oldPrefix = await writePrefix(prefix, msg);
      if (msg.guild) msg.guild.commandPrefix = prefix; else this.client.commandPrefix = prefix;
      const embed = new Discord.MessageEmbed()
        .setColor('#ff548e')
        .setDescription(`The guild prefix has been updated`)
        .addField('From', `**${oldPrefix}**`, true)
        .addField('To', `**${args.prefix}**`, true)
        .addField('Usage', `${msg.anyUsage('command')}`);
      // send embed
      return sendtoLogChan(msg, { embedMsg: embed });
    }
    return null;
  }

  async onBlock(msg, reason, data) {
    super.onBlock(msg, reason, data)
      .then(blockMsg => blockMsg.delete({ timeout: 10000 }))
      .catch(e => e); // do nothing
  }

  onError(err, message, args, fromPattern, result) {
    super.onError(err, message, args, fromPattern, result)
      .then(msgParent => msgParent.delete({ timeout: 10000 }))
      .catch(e => e); // do nothing
  }
};
