const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/verifyToken");

const ProductController = require("../controllers/product.controller");
const BlogController = require("../controllers/blog.controller");
const locationRouter = require("./location.route");
const contactInfoRouter = require("./contact.route");
const cartRouter = require("./cart.route");
const authRouter = require("./auth.route");
const userRouter = require("./user.route");
const orderRouter = require("./order.route");

router.use("/location", locationRouter);
router.use("/contact", contactInfoRouter);
// [GET] Tìm kiếm sản phẩm
router.get("/product/search/:keyword", ProductController.searchProduct);
// [GET] Lấy tất cả sản phẩm
router.get("/products", ProductController.index);
// [GET] Lấy tất cả bài viết
router.get("/blogs", BlogController.index);
// [GET] Lấy 1 bài viết
router.get("/blog/:slug", BlogController.getBlogBySlug);
router.use("/cart", verifyToken, cartRouter);
router.get("/getProductById/:id", ProductController.getProductById);
router.use("/auth", authRouter);
router.use("/user", verifyToken, userRouter);
router.use("/order", verifyToken, orderRouter);
module.exports = router;
