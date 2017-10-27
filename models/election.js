const Mongo = require('./index');

const ElectionModel = Mongo.model('Election', {
  unit: {
    type: String,
    required: true,
  },
  requestedDates: {
    type: Array,
    required: true,
  },
  status: {
    type: Number,
    required: true,
  },
  notifyImmediately: {
    type: Boolean,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  youthRegistered: {
    type: Number,
    required: true,
  },
  youthAttendance: {
    type: Number,
    required: true,
  },
  election1Ballots: {
    type: Number,
    required: true,
  },
  election2Ballots: {
    type: Number,
  },
});

module.exports = ElectionModel;
