const mongoose = require('models/db');
const { Schema } = require('mongoose');

const electionSchema = new Schema({
  unitId: {
    type: String,
    required: true,
  },
  requestedDates: {
    type: Array,
    required: true,
  },
  season: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  notifyImmediately: {
    type: Boolean,
  },
  date: {
    type: Date,
  },
  youthAttendance: {
    type: Number,
  },
  election1Ballots: {
    type: Number,
  },
  election2Ballots: {
    type: Number,
  },
  chapter: {
    type: String,
  },
});

module.exports = mongoose.model('Election', electionSchema);
