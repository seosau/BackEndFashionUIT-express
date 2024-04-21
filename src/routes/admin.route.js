const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/product.controller");
const BlogController = require("../controllers/blog.controller");
// Route Product
router.post("/product/store", ProductController.store);
router.get("/product/:slug", ProductController.getproductbyslug);
router.put("/product/update/:slug", ProductController.update);
router.delete("/product/delete/:slug", ProductController.delete);
router.get("/products", ProductController.index);

// Route blog

router.post("/blog/store", BlogController.store);
router.get("/blog/:slug", BlogController.getBlogBySlug);
router.put("/blog/update/:slug", BlogController.update);
router.delete("/blog/delete/:slug", BlogController.delete);
router.get("/blogs", BlogController.index);
const { verifyToken } = require("../middlewares/verifyToken");
const { isAdmin } = require("../middlewares/isAdmin");

router.post("/product/store", isAdmin, ProductController.store);
router.get("/product/:slug", isAdmin, ProductController.getproductbyslug);
router.put("/product/update/:slug", isAdmin, ProductController.update);
router.delete("/product/delete/:slug", isAdmin, ProductController.delete);
router.get("/products", isAdmin, ProductController.index);

module.exports = router;
