const mongoose = require("mongoose");

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_CONNECTION_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
};

module.exports = { connect };
