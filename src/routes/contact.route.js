const express = require("express");
const router = express.Router();

const ContactController = require("../controllers/contact.controller");

router.post("/store", ContactController.store);

module.exports = router;
