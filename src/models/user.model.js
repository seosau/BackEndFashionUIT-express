const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    addresses: [
      {
        type: Object,
      },
    ],
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAuthenticated: {
      type: Boolean,
      default: false,
    },
    otp: {
      otp: String,
      expireAt: Date,
    },
    verificationToken: String,
    passwordToken: {
      passwordToken: String,
      expireAt: Date,
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
