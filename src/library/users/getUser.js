function getUserMention(mention, message) {
  if (!mention) return;
  // getting id with regex
  let id = mention.match(/^<@!?(\d+)>$/)
  // return cached user
  return message.guild.members.cache.get(id[1]);

}

function getUserIdMention(mention) {
  if (!mention) return;
  // filter id with regex
  let id = mention.match(/^<@!?(\d+)>$/)
  // return string user id
  return id[1];
}

module.exports = {
  getUserMention,
  getUserIdMention
};