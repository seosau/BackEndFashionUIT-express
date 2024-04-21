const express = require("express");
const router = express.Router();

const locationRouter = require("./location.route");
const contactInfoRouter = require("./contact.route");
router.use("/location", locationRouter);
router.use("/contact", contactInfoRouter);
module.exports = router;
