const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types; // Import ObjectId từ Schema.Types
const locationSchema = new Schema({
    _id: {type: ObjectId},
    city: {type: String},
    district: {type: String},
    ward: {type: String},
    coordinate: {
        longitude: {type: Number},
        latitude: {type: Number},
    },
    addressDetail: {type: String},
    phoneNumber: {type: String},
    created_at: { type: Date, default: () => Date.now() },
    updated_at: { type: Date, default: () => Date.now() },
})

module.exports = mongoose.model('Location', locationSchema);