const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/product.controller");
const BlogController = require("../controllers/blog.controller");
const { isAdmin } = require("../middlewares/isAdmin");
// Route Product
router.post("/product/store", isAdmin, ProductController.store);
router.get("/product/:slug", isAdmin, ProductController.getproductbyslug);
router.put("/product/update/:slug", isAdmin, ProductController.update);
router.delete("/product/delete/all", isAdmin, ProductController.deleteSelectedProduct);
router.delete("/product/delete/:slug", isAdmin, ProductController.delete);
router.get("/products", isAdmin, ProductController.index);
// Route blog
router.post("/blog/store", isAdmin, BlogController.store);
router.get("/blog/:slug", isAdmin, BlogController.getBlogBySlug);
router.put("/blog/update/:slug", isAdmin, BlogController.update);
router.delete("/blog/delete/:slug", isAdmin, BlogController.delete);
router.get("/blogs", isAdmin, BlogController.index);

module.exports = router;
