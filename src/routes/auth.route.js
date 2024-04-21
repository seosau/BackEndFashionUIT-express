const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { verifyToken } = require("../middlewares/verifyToken");
router.post("/register", authController.regitation);
router.get("/verify/:token", authController.verifyToken);
router.post("/login", authController.login);

module.exports = router;
