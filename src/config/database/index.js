const mongoose = require("mongoose");

async function connect() {
  try {
    await mongoose.connect("url");
    console.log("success");
  } catch (error) {
    console.log(error);
  }
}

module.exports = { connect };
