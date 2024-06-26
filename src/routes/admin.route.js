const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/product.controller");
const BlogController = require("../controllers/blog.controller");
const AccountController = require("../controllers/account.controller");
const OrderController = require("../controllers/order.controller");

const hourlySaleController = require("../controllers/hourlySale.controller");
const DashboardController = require("../controllers/dashboard.controller");
const { isAdmin } = require("../middlewares/isAdmin");
// Route Product
router.post("/product/store", isAdmin, ProductController.store);
router.get("/product/edit/:slug", isAdmin, ProductController.getproductbyslug);
router.put("/product/update/:slug", isAdmin, ProductController.update);
router.delete("/product/delete/all", isAdmin, ProductController.deleteSelectedProduct);
router.delete("/product/delete/:slug", isAdmin, ProductController.delete);
router.get("/products", isAdmin, ProductController.index);
// Route blog
router.post("/blog/store", isAdmin, BlogController.store);
router.get("/blog/:slug", isAdmin, BlogController.getBlogBySlug);
router.put("/blog/update/:slug", isAdmin, BlogController.update);
router.get("/blog/search/:keyword", BlogController.searchBlog);
router.delete("/blog/delete/all", isAdmin, BlogController.deleteSelectedBlogs);
router.delete("/blog/delete/:slug", isAdmin, BlogController.delete);
router.get("/blogs", isAdmin, BlogController.index);
// Route account
router.get("/accounts", isAdmin, AccountController.index);
router.get("/account/search/:keyword", isAdmin, AccountController.searchAccount);
router.delete("/account/delete/all", isAdmin, AccountController.deleteSelectedAccounts);
router.delete("/account/delete/:email", isAdmin, AccountController.delete);
router.post("/accounts/change-role", isAdmin, AccountController.changeRole);

//Router order
router.get("/orders", isAdmin, OrderController.index);
router.get("/orders/search-by-user", isAdmin, OrderController.getByUserId);
router.post("/orders/change-status", isAdmin, OrderController.changeStatus);
router.delete("/orders/delete", isAdmin, OrderController.delete);
//
router.post("/sale/add", isAdmin, hourlySaleController.store);
// Route dashboard
router.get("/dashboard", DashboardController.index.bind(DashboardController));
module.exports = router;
