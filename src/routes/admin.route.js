const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/product.controller");

router.post('/product/store', ProductController.store);
router.put("/product/update/:id", ProductController.update);
router.delete("/product/delete/:id", ProductController.delete);
router.get("/products", ProductController.index);

module.exports = router;
