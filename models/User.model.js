const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
  confirmationCode: {
    type: String
  },
  password: {
    type: String,
    required: true,
  },
  watchlist: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Watchlist',
  },
  createdAt: { 
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

const User = model("User", userSchema);

module.exports = User;
