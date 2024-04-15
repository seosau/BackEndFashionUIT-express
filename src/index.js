// config server app
const express = require("express");
const app = express();

// config port
const port = 8000;

// config .env
const dotenv = require("dotenv");
dotenv.config();

// config database
const db = require("./config/database");
db.connect();


app.listen(port, () => {
  console.log(`Server app listening on port ${port}`);
});
