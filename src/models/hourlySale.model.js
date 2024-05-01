const mongoose = require("mongoose");

const HourlySaleSchema = new mongoose.Schema({
  saleHour: Number,
  saleDay: {
    type: Date,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  saleCount: {
    type: Number,
    default: 0,
  },
  discountPercent: {
    type: Number,
    default: 0,
  },
});

const HourlySale = mongoose.model("HourlySale", HourlySaleSchema);

module.exports = HourlySale;
