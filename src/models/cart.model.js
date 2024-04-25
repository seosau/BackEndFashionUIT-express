const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const cartSchema = new Schema({
    userId: {
        type: ObjectId,
        ref: "User",
        required: true,
    },
    totalPrice: { type: Number },
    products: [
        {
            productId: { type: ObjectId, ref: "Product", required: true, },
            size: { type: String },
            color: { type: String },
            quantity: { type: Number },
            price: { type: Number}
        }
    ]
})

module.exports = mongoose.model("Cart", cartSchema);