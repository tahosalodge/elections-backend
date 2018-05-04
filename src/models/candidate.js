const mongoose = require('models/db');
const {
  Schema
} = require('mongoose');

const candidateSchema = new Schema({
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
  rank: {
    type: String,
    required: true,
  },
  electionId: {
    type: String,
    required: true,
  },
  unitId: {
    type: String,
    required: true,
  },
  address: {
    type: Object,
    required: true,
  },
  parentPhone: {
    type: String,
    required: true,
  },
  parentEmail: {
    type: String,
    required: true,
  },
  youthPhone: {
    type: String,
  },
  youthEmail: {
    type: String,
  },
  campingLongTerm: {
    type: String,
  },
  campingShortTerm: {
    type: String,
  },
  chapter: {
    type: String,
    required: true,
  },
  status: {
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

module.exports = mongoose.model('Candidate', candidateSchema);