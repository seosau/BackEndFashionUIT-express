const express = require("express");
const router = express.Router();

const orderController = require("../controllers/order.controller");

router.post("/create", orderController.createOrder);
router.post("/vnpay/url", orderController.createUrlVnPay);
router.post("/vnpay/create", orderController.createOrderVnPay);
router.get("/get-all", orderController.getOrders);
router.get("/get", orderController.getOrder);
router.post("/vnpay/re-pay", orderController.rePay);

module.exports = router;
