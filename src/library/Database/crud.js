const mongoose = require('mongoose');

class crud {
  constructor(url = 'mongodb://localhost:27017/romono') {
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