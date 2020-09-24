const mongoose = require('mongoose');

let reqNumber = {
  type: Number,
  required: true
}

const guildSettings = new mongoose.Schema({
  _id: reqNumber, // guild id
  AutoAssignRoleId: Number,
  LogChannelId: Number,
  WelcomeMessage: String,
  GoodbyeMessage: String,
  prefix: String
})

const userData = new mongoose.Schema({
  _id: reqNumber, // member id
  money: Number
})

const musicQueue = new mongoose.Schema({
  _id: reqNumber, // guild id
  Title: String,
  Uploader: String,
  Url: String
})

const musicPlaylists = new mongoose.Schema({
  _id: reqNumber, // member id
  Title: String,
  Uploader: String,
  Url: String,
})


const guildSettingsSchema = mongoose.model('guildSettings', guildSettings);
const userDataSchema = mongoose.model('userData', userData);
const musicQueueSchema = mongoose.model('musicQueue', musicQueue);
const musicPlaylistsSchema = mongoose.model('musicPlaylists', musicPlaylists);


module.exports = {
  guildSettingsSchema,
  userDataSchema,
  musicQueueSchema,
  musicPlaylistsSchema
}