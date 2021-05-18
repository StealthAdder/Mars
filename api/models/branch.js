// branch schema
const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  branchName: {
    type: String,
    required: true,
  },
  currentSha: {
    type: String,
  },
  previousSha: {
    type: String,
  },
});

module.exports = mongoose.model('watching', branchSchema);
