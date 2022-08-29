const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  user: String,
  password: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports.mongoose.model("User", userSchema);
