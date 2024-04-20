const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const contactInfoSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ContactInfo", contactInfoSchema);
