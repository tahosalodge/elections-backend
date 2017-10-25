const mongoose = require('mongoose');

mongoose.promise = global.promise;
const conn = mongoose.createConnection(process.env.DATABASE, {
  useMongoClient: true,
});

module.exports = conn;
