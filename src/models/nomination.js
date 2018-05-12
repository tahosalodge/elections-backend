const mongoose = require('models/db');
const {
  Schema
} = require('mongoose');

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
    type: String,
    required: true,
  },
  electionId: {
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
  notified: {
    type: Date,
  },
  exported: {
    type: Date,
  },
});

module.exports = mongoose.model('Nomination', nominationSchema);