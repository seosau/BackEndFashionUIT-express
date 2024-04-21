// config server app
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
// config port
const port = 8000;

// config cors
const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // cho phép gửi cookie
  })
);
app.use(cookieParser());
// Phân tích dữ liệu JSON
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// config path
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));

// config .env
const dotenv = require("dotenv");
dotenv.config();

// config route
const route = require("./routes");
route(app);

// config database
const db = require("./config/database");
db.connect();

app.listen(port, () => {
  console.log(`Server app listening on port ${port}`);
});
