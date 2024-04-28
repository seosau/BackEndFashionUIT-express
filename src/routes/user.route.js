const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
router.post("/address/add", userController.addAddress);
router.get("/address", userController.getAddress);
router.post("/address/delete", userController.deleteAddress);

module.exports = router;
