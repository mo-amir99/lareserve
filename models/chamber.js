var mongoose = require("mongoose");

var ChamberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  maxCapacity: {
    type: Number,
    required: false,
  },
  members: {
    type: Map,
  },
});

module.exports = mongoose.model("Chamber", ChamberSchema);
