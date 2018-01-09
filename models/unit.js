const Mongo = require('./index');

const UnitModel = Mongo.model('Unit', {
  number: {
    type: String,
    required: true,
  },
  chapter: {
    type: String,
    required: true,
  },
  activeMembers: {
    type: Number,
    required: true,
  },
  meetingLocation: {
    type: Object,
    required: true,
  },
  unitleader: {
    type: Object,
    required: true,
  },
  adultRepresentative: {
    type: Object,
    required: true,
  },
  youthRepresentative: {
    type: Object,
    required: true,
  },
  users: {
    type: Array,
    required: true,
  },
  pendingUsers: {
    type: Array,
  },
});

module.exports = UnitModel;
