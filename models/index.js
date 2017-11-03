const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const conn = mongoose.createConnection(process.env.DATABASE, {
  useMongoClient: true,
});

module.exports = conn;
