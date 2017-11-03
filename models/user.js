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
  capability: {
    type: String,
    required: true,
    default: 'unit',
  },
  password: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

module.exports = UserModel;
