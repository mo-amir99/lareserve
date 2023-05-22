var mongoose = require("mongoose");

var ReservationSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  members: {
    type: Array,
    required: true,
  },
  time: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("Reservation", ReservationSchema);
