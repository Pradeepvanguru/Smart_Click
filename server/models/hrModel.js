const mongoose = require("mongoose");

const hrSchema = new mongoose.Schema({
  name: String,
  email: String,
  company: String,
  title:String
});

module.exports = mongoose.model("HR", hrSchema);
