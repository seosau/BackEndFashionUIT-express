const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/product.controller");
const { verifyToken } = require("../middlewares/verifyToken");
const { isAdmin } = require("../middlewares/isAdmin");

router.post("/product/store", isAdmin, ProductController.store);
router.get("/product/:slug", isAdmin, ProductController.getproductbyslug);
router.put("/product/update/:slug", isAdmin, ProductController.update);
router.delete("/product/delete/:slug", isAdmin, ProductController.delete);
router.get("/products", isAdmin, ProductController.index);

module.exports = router;
