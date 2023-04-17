var mongoose = require("mongoose");

var OrganizationSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    required: true,
  },
  chambers: {
    type: Array,
  },
});

module.exports = mongoose.model("Organization", OrganizationSchema);
