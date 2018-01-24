const mongoose = require('models/db');
const { Schema } = require('mongoose');

const userSchema = new Schema({
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: 'Please supply an email address',
  },
  chapter: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
  },
  capability: {
    type: String,
    required: true,
    default: 'unit',
  },
  password: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

module.exports = mongoose.model('User', userSchema);
