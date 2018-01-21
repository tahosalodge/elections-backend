const Mongo = require('./index');

const CandidateModel = Mongo.model('Candidate', {
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
  rank: {
    type: String,
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
    required: true,
  },
  YouthEmail: {
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

module.exports = CandidateModel;