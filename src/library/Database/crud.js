const mongoose = require('mongoose');

class crud {
  constructor(url = process.env.MONGO_URL) {
    this.url = url;
  }

  connect() {
    mongoose.connect(this.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    });
    return mongoose;
  }
}

module.exports = {
  crud
}