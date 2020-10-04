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

  close() {
    return mongoose.connection.close();
  }

  async writeOneUpdate(schema, identifier, update = {}) {
    return await schema.findOneAndUpdate({ _id: identifier }, update, {
      upsert: true
    });
  }

  async findById(schema, id) {
    return await schema.findById(id);
  }

  async findByIdDelete(schema, id) {
    return await schema.findByIdAndDelete(id);
  }
}

module.exports = {
  crud
}