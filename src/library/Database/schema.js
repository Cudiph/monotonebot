const mongoose = require('mongoose');

const reqNumber = {
  type: Number,
  required: true
}

const guildSettings = new mongoose.Schema({
  _id: reqNumber, // guild id
  autoAssignRoleId: Number,
  logChannelId: Number,
  welcomeMessage: {
    Channel: Number,
    Message: String
  },
  goodbyeMessage: {
    Channel: Number,
    Message: String
  },
  prefix: {
    type: String,
    default: '..'
  },
  volume: Number,
})

const userData = new mongoose.Schema({
  id: reqNumber, // member id
  money: Number,
  userPlaylists: [{
    name: String,
    description: String,
    videoList: [{
      title: String,
      link: String,
      videoId: String,
      uploader: String,
      seconds: Number,
      author: String,
    }],
    timestamps: { type: Date, default: new Date() },
  }]
})

const musicQueue = new mongoose.Schema({
  guildId: reqNumber, // guild id
  queue: [{
    Title: String,
    Uploader: String,
    Url: String
  }],
  Date: { type: Date, default: Date.now, index: true }
})

const guildSettingsSchema = mongoose.model('guildSettings', guildSettings);
const userDataSchema = mongoose.model('userData', userData);
const musicQueueSchema = mongoose.model('musicQueue', musicQueue);


module.exports = {
  guildSettingsSchema,
  userDataSchema,
  musicQueueSchema,
}