/* eslint-disable indent */
const { Structures, escapeMarkdown, resolveString, APIMessage } = require('discord.js');
const gtrans = require('node-gtrans');

module.exports = Structures.extend('Message', Message => {
  class MonoMessage extends Message {
    constructor(...args) {
      super(...args);
    }

    async respond({ type = 'reply', content, options, lang, fromEdit = false }) {
      const shouldEdit = this.responses && !fromEdit;
      if (shouldEdit) {
        if (options && options.split && typeof options.split !== 'object') options.split = {};
      }

      if (type === 'reply' && this.channel.type === 'dm') type = 'plain';
      if (type !== 'direct') {
        if (this.guild && !this.channel.permissionsFor(this.client.user).has('SEND_MESSAGES')) {
          type = 'direct';
        }
      }

      // sometimes a backtick is translated to a quotes nad it's bad for codeblock. So before it translated,
      // the backticks need to be replaced to random string and replace again after the text is translated
      content = resolveString(content).replace(/```/g, '<jhghghggvyty>').replace(/``/g, '<defffgghhh>');

      const splittedContent = content.split(' ');

      // too lazy to make json or whatever it used for i18n
      // A little bit broken when dealing with names because command name and variable name are translated
      if (content && type !== 'code' && this.guild && this.guild.language !== 'en') {
        const langCacheKey = `${this.guild.language}-${splittedContent[0]}-${content.length}`;
        if (!this.client.langCache.has(langCacheKey)) {
          try {
            content = await gtrans(content, { to: this.guild.language, content: ['t'] })
              .then(res => res.data.translated.replace(/<jhghghggvyty> ?/g, '```').replace(/<defffgghhh>/g, '``'));
            this.client.langCache.set(langCacheKey, content);
          } catch (e) {
            logger.error(e);
          }
        } else {
          content = this.client.langCache.get(langCacheKey);
        }
      }

      switch (type) {
        case 'plain':
          if (!shouldEdit) return this.channel.send(content, options);
          return this.editCurrentResponse(channelIDOrDM(this.channel), { type, content, options });
        case 'reply':
          if (!shouldEdit) return this._originalReply(content, options);
          if (options && options.split && !options.split.prepend) options.split.prepend = `${this.author}, `;
          return this.editCurrentResponse(channelIDOrDM(this.channel), { type, content, options });
        case 'direct':
          if (!shouldEdit) return this.author.send(content, options);
          return this.editCurrentResponse('dm', { type, content, options });
        case 'code':
          if (!shouldEdit) return this.channel.send(content, options);
          if (options && options.split) {
            if (!options.split.prepend) options.split.prepend = `\`\`\`${lang || ''}\n`;
            if (!options.split.append) options.split.append = '\n```';
          }
          content = `\`\`\`${lang || ''}\n${escapeMarkdown(content, true)}\n\`\`\``;
          return this.editCurrentResponse(channelIDOrDM(this.channel), { type, content, options });
        default:
          throw new RangeError(`Unknown response type "${type}".`);
      }
    }

    _originalReply(content, options) {
      return this.channel.send(
        content instanceof APIMessage
          ? content
          : APIMessage.transformOptions(content, options, { reply: this.member || this.author }),
      );
    }
  }

  return MonoMessage;
});


function channelIDOrDM(channel) {
  if (channel.type !== 'dm') return channel.id;
  return 'dm';
}
