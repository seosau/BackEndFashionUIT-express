const express = require("express");
const router = express.Router();

const ProductController = require("../controllers/product.controller");

const locationRouter = require("./location.route");
const contactInfoRouter = require("./contact.route");

router.use("/location", locationRouter);
router.use("/contact", contactInfoRouter);
router.get("/product/search/:keyword", ProductController.searchProduct);
module.exports = router;
