const mongoose = require('mongoose');

let reqNumber = {
  type: Number,
  required: true
}

const guildSettings = new mongoose.Schema({
  _id: reqNumber, // guild id
  AutoAssignRoleId: Number,
  LogChannelId: Number,
  WelcomeMessage: {
    Channel: Number,
    Message: String
  },
  GoodbyeMessage: {
    Channel: Number,
    Message: String
  },
  prefix: {
    type: String,
    default: '..'
  }
})

const userData = new mongoose.Schema({
  _id: reqNumber, // member id
  Money: Number
})

const musicQueue = new mongoose.Schema({
  GuildId: reqNumber, // guild id
  Queue: [{
    Title: String,
    Uploader: String,
    Url: String
  }],
  Date: { type: Date, default: Date.now, index: true }
})

const musicPlaylists = new mongoose.Schema({
  UserId: reqNumber, // member id
  Playlists:[{
    Title: String,
    Uploader: String,
    Url: String
  }],
  Date: { type: Date, default: Date.now, index: true }
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