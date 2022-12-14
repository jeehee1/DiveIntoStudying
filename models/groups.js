const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { subjects } = require("../datas/seedHelpers");

const imageSchema = new Schema({
  url: String,
  filename: String,
});

const groupSchema = new Schema({
  title: String,
  subject: {
    type: String,
    enum: subjects,
    required: true,
  },
  location: String,
  times: Number,
  online: {
    type: String,
    enum: ["y", "n"],
  },
  image: imageSchema,
  description: String,
  leader: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("Group", groupSchema);
