const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/verifyToken");

const locationRouter = require("./location.route");
const contactInfoRouter = require("./contact.route");
router.use("/location", verifyToken, locationRouter);
router.use("/contact", verifyToken, contactInfoRouter);
module.exports = router;
