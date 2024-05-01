const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    images: { type: Array },
    description: {
      type: String,
      required: true,
    },
    shortDesc: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      categoryType: { type: String },
      sex: { type: String },
      fabricType: { type: String },
      categoryDetail: { type: String },
    },
    colors: { type: Array },
    sizes: { type: Array },
    stock: { type: Array },
    slug: {
      type: String,
      unique: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
