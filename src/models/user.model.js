const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 6,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^[\w.-]+@gmail\.com$/, "Only @gmail.com emails allowed"],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  presenceStatus: {
    type: String,
    enum: ["online", "offline"],
    default: "offline",
  },
  accessToken: {
    type: String,
    unique: true,
    sparse: true,
  },
  refreshToken: {
    type: String,
    unique: true,
    sparse: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
