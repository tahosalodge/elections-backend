const uniqueValidator = require('mongoose-unique-validator');
const mongoose = require('./index');
const { Schema } = require('mongoose');

const unitSchema = new Schema({
  number: {
    type: String,
    required: true,
    unique: true,
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
  unitLeader: {
    type: Object,
    required: true,
  },
  adultRepresentative: {
    type: Object,
  },
  youthRepresentative: {
    type: Object,
  },
  users: {
    type: Array,
    required: true,
  },
  pendingUsers: {
    type: Array,
  },
});

unitSchema.plugin(uniqueValidator);
const UnitModel = mongoose.model('Unit', unitSchema);
module.exports = UnitModel;
