var mongoose = require("mongoose");
var members = require("./reservation");

var ChamberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  maxCapacity: {
    type: Number,
    required: false,
  },
  reservations: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reservation",
  },
});

module.exports = mongoose.model("Chamber", ChamberSchema);
