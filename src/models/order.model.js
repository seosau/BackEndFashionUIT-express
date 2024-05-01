const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const orderSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      type: Object,
    },
    totalPrice: {
      type: Number,
    },
    paid: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      default: "Chờ xác nhận",
    },
    status: {
      type: String,
    },
    products: [
      {
        type: Object,
      },
    ],
    note: {
      type: String,
      default: null,
    },
    expireAt: { type: Date, default: Date.now, index: { expires: "1d" } },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
