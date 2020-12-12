const mongoose = require('mongoose');

const reqNumber = {
  type: Number,
  required: true,
}

const reqStr = {
  type: String,
  required: true,
}

const guildSettings = new mongoose.Schema({
  guildId: reqStr, // guild id
  guildName: String,
  autoAssignRoleId: String,
  logChannelId: String,
  welcomeMessage: {
    Channel: String,
    Message: String
  },
  goodbyeMessage: {
    Channel: String,
    Message: String
  },
  prefix: {
    type: String,
    default: '..'
  },
  volume: Number,
})

const userData = new mongoose.Schema({
  userId: reqStr, // member id
  exp: Number,
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

const guildSettingsSchema = mongoose.model('guildSettings', guildSettings);
const userDataSchema = mongoose.model('userData', userData);


module.exports = {
  guildSettingsSchema,
  userDataSchema,
}