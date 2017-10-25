const Mongo = require('./index');

const UserModel = Mongo.model('User', {
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
    required: true,
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
  capabilities: {
    type: Array,
    required: true,
  },
  password: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

module.exports = UserModel;
