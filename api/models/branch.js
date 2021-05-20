// branch schema
const mongoose = require('mongoose');
const moment = require('moment');
const branchSchema = new mongoose.Schema({
  branchName: {
    type: String,
    required: true,
  },
  currentSha: {
    type: String,
  },
  origin: {
    type: String,
    default: moment().format(),
  },
  updated: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model('watching', branchSchema);
