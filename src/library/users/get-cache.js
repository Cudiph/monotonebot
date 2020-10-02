function getUserMention(mention, message) {
  if (!mention) return;
  // getting id with regex
  let id = mention.match(/^<@!?(\d+)>$/);
  // return cached user
  return message.guild.members.cache.get(id[1]);
}

async function isUserId(mention, message) {
  if (!mention) return;
  let isUserId = await message.guild.members.cache.get(mention);
  if (isUserId) return true; else return false;
}

function getUserIdMention(mention) {
  if (!mention) return;
  // filter id with regex
  let id = mention.match(/^<@!?(\d+)>$/);
  // return string user id
  return id[1];
}

function getChannelMention(mention, message) {
  if (!mention) return;
  // getting id with regex
  let id = mention.match(/^<#(\d+)>$/);
  // return cached user
  return message.guild.channels.cache.get(id[1]);

}

function getChannelIdMention(mention) {
  if (!mention) return;
  // filter id with regex
  let id = mention.match(/^<#(\d+)>$/);
  // return string user id
  return id[1];
}

module.exports = {
  getUserMention,
  getUserIdMention,
  getChannelMention,
  getChannelIdMention,
  isUserId,
};