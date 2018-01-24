const mongoose = require('mongoose');

const conn = mongoose.createConnection(process.env.DATABASE);

module.exports = conn;
