const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { verifyToken } = require("../middlewares/verifyToken");
router.post("/address/add", verifyToken, userController.addAddress);
router.get("/address", verifyToken, userController.getAddress);
router.post("/address/delete", verifyToken, userController.deleteAddress);

module.exports = router;
