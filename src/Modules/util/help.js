const { stripIndents, oneLine } = require('common-tags');
const { Command } = require('discord.js-commando')

module.exports = class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'help',
      group: 'util',
      memberName: 'help',
      aliases: ['commands'],
      description: 'Displays a list of available commands, or detailed information for a specified command.',
      details: oneLine`
				The command may be part of a command name or a whole command name.
				If it isn't specified, all available commands will be listed.
			`,
      examples: ['help', 'help prefix'],
      guarded: true,
      args: [
        {
          key: 'command',
          prompt: 'Which command would you like to view the help for?',
          type: 'string',
          default: ''
        }
      ],
    });
  }

  async run(msg, args) { // eslint-disable-line complexity
    const groups = this.client.registry.groups;
    const commands = this.client.registry.findCommands(args.command, false, msg);
    const showAll = args.command && args.command.toLowerCase() === 'all';
    let embed = {
      color: 0xff548e,
      fields: [
        {
          name: `**Format:**`,
          value: `${msg.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}` : ''}`)}`
        }
      ]
    }
    if (args.command && !showAll) {
      if (commands.length === 1) {
        embed.description = stripIndents`
					${oneLine`
						Command **${commands[0].name}**: ${commands[0].description}
						${commands[0].guildOnly ? ' (Usable only in servers)' : ''}
						${commands[0].nsfw ? ' (NSFW)' : ''}
					`}
        `;

        if (commands[0].aliases.length > 0) embed.fields.push({ name: `**Aliases:** `, value: `${commands[0].aliases.join(', ')}`, inline: true });
        embed.fields.push({
          name: `**Group:**`,
          value: oneLine`
            ${commands[0].group.name}
            (\`${commands[0].groupID}:${commands[0].memberName}\`)
          `,
          inline: true,
        });

        if (commands[0].details) embed.fields.push({ name: `**Details:**`, value: commands[0].details });
        if (commands[0].examples) embed.fields.push({ name: `**Examples:**`, value: '- ..' + commands[0].examples.join('\n- ..') });

        const messages = [];
        try {
          messages.push(await msg.direct({ embed }));
          if (msg.channel.type !== 'dm') messages.push(await msg.reply('Sent you a DM with information.'));
        } catch (err) {
          messages.push(await msg.reply('Unable to send you the help DM. You probably have DMs disabled.'));
        }
        return messages;
      } else if (commands.length > 15) {
        return msg.reply('Multiple commands found. Please be more specific.');
      } else if (commands.length > 1) {
        return msg.reply(disambiguation(commands, 'commands'));
      } else {
        return msg.reply(
          `Unable to identify command. Use ${msg.usage(
            null, msg.channel.type === 'dm' ? null : undefined, msg.channel.type === 'dm' ? null : undefined
          )} to view the list of all commands.`
        );
      }
    } else {
      const messages = [];
      try {
        messages.push(await msg.direct(stripIndents`
					${oneLine`
						To run a command in ${msg.guild ? msg.guild.name : 'any server'},
						use ${Command.usage('command', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
						For example, ${Command.usage('prefix', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
					`}
					To run a command in this DM, simply use ${Command.usage('command', null, null)} with no prefix.

					Use ${this.usage('<command>', null, null)} to view detailed information about a specific command.
					Use ${this.usage('all', null, null)} to view a list of *all* commands, not just available ones.

					__${showAll ? 'All commands' : `Available commands in **${msg.guild || 'this DM'}**`}__

					${groups.filter(grp => grp.commands.some(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg))))
            .map(grp => {
              let longest = 0;
              grp.commands.filter(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg))).forEach(cmd => {
                if (cmd.name.length > longest) longest = cmd.name.length;
              });
              return stripIndents`
                **${grp.name}**
                ${grp.commands.filter(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg)))
                  .map(cmd => {
                    let cmdIndent = longest + 1 - cmd.name.length;
                    if (cmdIndent < 0) cmdIndent = 0;
                    return `**\`- ${cmd.name + ' '.repeat(cmdIndent)}:\`** ${cmd.description}${cmd.nsfw ? ' (NSFW)' : ''}`;
                  }).join('\n')
                }
						  `}).join('\n\n')
          }
				`, { split: true }));
        if (msg.channel.type !== 'dm') messages.push(await msg.reply('Sent you a DM with in formation.'));
      } catch (err) {
        messages.push(await msg.reply('Unable to send you the help DM. You probably have DMs disabled.'));
      }
      return messages;
    }
  }
};
