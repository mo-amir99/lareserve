var mongoose = require("mongoose");

var ChamberSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
  },
  name: {
    type: String,
    required: true,
  },
  maxCapacity: {
    type: Number,
    required: false,
  },
  members: {
    type: Array,
  },
});

module.exports = mongoose.model("Chamber", ChamberSchema);
