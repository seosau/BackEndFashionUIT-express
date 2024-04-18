const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/product.controller");


router.post("/product/store", ProductController.store);
router.get("/product/:slug", ProductController.getproductbyslug);
router.put("/product/update/:slug", ProductController.update);
router.delete("/product/delete/:slug", ProductController.delete);
router.get("/products", ProductController.index);

module.exports = router;
