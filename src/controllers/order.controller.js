const Order = require("../models/order.model.js");
const User = require("../models/user.model.js");
const CartController = require("./cart.controller.js");
const cartModel = require("../models/cart.model");
const moment = require("moment");
const { param } = require("../routes/order.route.js");
const { response } = require("express");
const sortObject = (obj) => {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
};

module.exports = {
  createOrder: async (req, res, next) => {
    try {
      const userId = req._id;
      const user = await User.findOne({ _id: userId });
      if (!user) {
        res.status(404).json({ message: "This user does not exist" });
      }
      const { orderInfo } = req.body;
      const newOrder = new Order(orderInfo);
      newOrder.userId = userId;
      var existingCart = await cartModel.findOne({ userId: userId });
      if (!existingCart) {
        return res.status(404).json({
          message: "Cart not exist!",
        });
      }
      for (var i = 0; i < orderInfo.products.length; i++) {
        const productId = orderInfo.products[i].productId;
        const color = orderInfo.products[i].color;
        const size = orderInfo.products[i].size;
        const indexProduct = existingCart.products.findIndex((product) => product.productId.toString() === productId.toString() && product.size === size && product.color === color);
        existingCart.products.splice(indexProduct, 1);
      }
      await existingCart.save();
      newOrder.expireAt = null;
      await newOrder.save();
      console.log("success");
      return res.status(200).json({
        message: "Order created successful!",
      });
    } catch (error) {
      return res.status(500).json({
        message: "An error occurs while creating order. Please try again later!",
      });
    }
  },
  createUrlVnPay: async (req, res, next) => {
    try {
      const { amount, bankCode, language, orderInfo } = req.body;
      const userId = req._id;
      const user = await User.findOne({ _id: userId });
      if (!user) {
        res.status(404).json({ message: "This user does not exist" });
      }
      const newOrder = new Order(orderInfo);
      newOrder.userId = userId;

      var existingCart = await cartModel.findOne({ userId: userId });
      if (!existingCart) {
        return res.status(404).json({
          message: "Cart not exist!",
        });
      }
      for (var i = 0; i < orderInfo.products.length; i++) {
        const productId = orderInfo.products[i].productId;
        const color = orderInfo.products[i].color;
        const size = orderInfo.products[i].size;
        const indexProduct = existingCart.products.findIndex((product) => product.productId.toString() === productId.toString() && product.size === size && product.color === color);
        existingCart.products.splice(indexProduct, 1);
      }

      //vnpay
      let config = require("../config/vnPay");
      process.env.TZ = "Asia/Ho_Chi_Minh";

      let date = new Date();
      let createDate = moment(date).format("YYYYMMDDHHmmss");

      let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
      let tmnCode = config.vnp_TmnCode;
      let secretKey = config.vnp_HashSecret;
      let vnpUrl = config.vnp_Url;
      let returnUrl = config.vnp_ReturnUrl;
      let orderId = newOrder._id;

      let locale = language;
      if (locale === null || locale === "") {
        locale = "vn";
      }
      let currCode = "VND";
      let vnp_Params = {};
      vnp_Params["vnp_Version"] = "2.1.0";
      vnp_Params["vnp_Command"] = "pay";
      vnp_Params["vnp_TmnCode"] = tmnCode;
      vnp_Params["vnp_Locale"] = locale;
      vnp_Params["vnp_CurrCode"] = currCode;
      vnp_Params["vnp_TxnRef"] = orderId;
      vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + orderId;
      vnp_Params["vnp_OrderType"] = "other";
      vnp_Params["vnp_Amount"] = amount * 100;
      vnp_Params["vnp_ReturnUrl"] = returnUrl;
      vnp_Params["vnp_IpAddr"] = ipAddr;
      vnp_Params["vnp_CreateDate"] = createDate;
      if (bankCode !== null && bankCode !== "") {
        vnp_Params["vnp_BankCode"] = bankCode;
      }
      vnp_Params = sortObject(vnp_Params);
      let querystring = require("qs");
      let signData = querystring.stringify(vnp_Params, { encode: false });
      let crypto = require("crypto");
      let hmac = crypto.createHmac("sha512", secretKey);
      let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
      console.log("-------------");
      console.log(vnp_Params);
      console.log("-------------");
      vnp_Params["vnp_SecureHash"] = signed;
      console.log("-------------");
      console.log(vnp_Params["vnp_SecureHash"]);
      console.log("-------------");

      vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

      await existingCart.save();
      await newOrder.save();
      res.status(200).json({
        message: "Order created successful!",
        vnpUrl,
      });
    } catch (error) {
      return res.status(500).json({
        message: "An error occurs while creating order. Please try again later!",
      });
    }
  },
  createOrderVnPay: async (req, res, next) => {
    try {
      console.log(req.query);
      console.log(-2);
      const params = req.body;
      var secureHash = params.vnp_SecureHash;
      let config = require("../config/vnPay");
      var secretKey = config.vnp_HashSecret;
      console.log(-1);

      console.log(params);
      delete params["vnp_SecureHash"];
      delete params["vnp_SecureHashType"];
      console.log("----------------------------------------------------");

      console.log(params);
      const signedParams = sortObject(params);
      var querystring = require("qs");
      var signData = querystring.stringify(signedParams, { encode: false });
      var crypto = require("crypto");
      console.log(0);

      var hmac = crypto.createHmac("sha512", secretKey);
      var signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
      console.log(0.5);

      console.log(signed);
      if (secureHash === signed) {
        const status = params.vnp_ResponseCode;

        const orderId = params.vnp_TxnRef;
        const userId = req._id;
        console.log(2);

        const user = await User.findOne({ _id: userId });
        if (!user) {
          res.status(404).json({ message: "This user does not exist" });
        }
        const order = await Order.findOne({ _id: orderId });
        console.log(3);
        console.log(order);

        if (status === "00") {
          order.paid = true;
          console.log(4);

          delete order.expireAt;
          console.log(5);
          order.expireAt = null;
          await order.save();
          console.log(6);

          return res.status(200).json({
            message: "Order created successful!",
            vnpUrl,
          });
        } else {
          return res.status(200).json({ status: 11, Message: "Fail checksum" });
        }
      } else {
        return res.status(200).json({ status: params.vnp_ResponseCode, Message: "Fail checksum" });
      }
    } catch (error) {
      return res.status(500).json({
        message: "An error occurs while creating order. Please try again later!",
      });
    }
  },
  getOrders: async (req, res) => {
    try {
      const userId = req._id;
      const orders = await Order.find({ userId: userId });
      if (!orders) {
        res.status(200).json({ orders: [], message: "This user have no order!" });
      }
      return res.status(200).json({
        message: "Orders send successful!",
        orders: orders,
      });
    } catch (error) {
      return res.status(500).json({
        message: "An error occurs while quering order. Please try again later!",
      });
    }
  },
  getOrder: async (req, res) => {
    try {
      const orderId = req.query.orderId;
      console.log(orderId);
      const order = await Order.findOne({ _id: orderId });
      if (!order) {
        return res.status(404).json({ message: "This order not exist!" });
      }
      return res.status(200).json({
        message: "Order send successful!",
        order,
      });
    } catch (error) {
      return res.status(500).json({
        message: "An error occurs while quering order. Please try again later!",
      });
    }
  },
};
