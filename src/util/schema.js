const mongoose = require('mongoose');

const reqStr = {
  type: String,
  required: true,
};

const guildSettings = new mongoose.Schema({
  guildID: reqStr, // guild id
  guildName: String,
  autoAssignRoleId: String,
  logChannelId: String,
  welcomeMessage: {
    channel: String,
    strMsg: String,
  },
  goodbyeMessage: {
    channel: String,
    strMsg: String,
  },
  prefix: {
    type: String,
    default: '..'
  },
  volume: Number,
  language: {
    type: String,
    default: 'en'
  }
}, { timestamps: true });

const userData = new mongoose.Schema({
  userID: reqStr, // member id
  exp: Number,
  money: Number,
  userPlaylists: [{
    name: String,
    description: String,
    videoList: [{
      title: String,
      link: String,
      videoID: String,
      uploader: String,
      seconds: Number,
      author: String,
      track: String,
    }],
    timestamps: { type: Date, default: new Date() },
  }]
}, { timestamps: true });

const guildSettingsSchema = mongoose.model('guildSettings', guildSettings);
const userDataSchema = mongoose.model('userData', userData);


module.exports = {
  guildSettingsSchema,
  userDataSchema,
};
