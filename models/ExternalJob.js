const mongoose = require("mongoose");

const externalJobSchema = new mongoose.Schema({
  Employer: String,
  Title: String,
  Location: String,
  Posted_At: Date,
  Description: String,
  Apply_Link: String,
});

module.exports = mongoose.model("ExternalJob", externalJobSchema);
