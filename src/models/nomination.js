const mongoose = require('./index');
const { Schema } = require('mongoose');

const nominationSchema = new Schema({
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  bsaid: {
    type: Number,
    required: true,
  },
  election: {
    type: String,
    required: true,
  },
  address: {
    type: Object,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  campingLongTerm: {
    type: String,
    required: true,
  },
  campingShortTerm: {
    type: String,
    required: true,
  },
  chapter: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  recommendation: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: Date,
  },
  updatedBy: {
    type: String,
  },
  notified: {
    type: Date,
  },
});

module.exports = mongoose.model('Nomination', nominationSchema);
