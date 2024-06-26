const Order = require("../models/order.model.js");
const User = require("../models/user.model.js");
const Product = require("../models/product.model.js");
const HourlySale = require("../models/hourlySale.model.js");
const CartController = require("./cart.controller.js");
const cartModel = require("../models/cart.model");
const moment = require("moment");

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
        return res.status(404).json({ message: "This user does not exist" });
      }
      const { orderInfo } = req.body;
      const newOrder = new Order(orderInfo);
      newOrder.userId = userId;
      newOrder.status = "Chờ xác nhận";
      var existingCart = await cartModel.findOne({ userId: userId });
      if (!existingCart) {
        return res.status(404).json({
          message: "Cart not exist!",
        });
      }

      for (var i = 0; i < orderInfo.products.length; i++) {
        const currentDate = new Date();
        const productId = orderInfo.products[i].productId;
        const color = orderInfo.products[i].color;
        const size = orderInfo.products[i].size;
        const product = await Product.findOne({ _id: productId });
        const hourlySales = await HourlySale.find({ productId: productId });
        hourlySales?.forEach((hourlySale, index) => {
          if (
            currentDate.getDate() === hourlySale.saleDay.getDate() &&
            currentDate.getMonth() === hourlySale.saleDay.getMonth() &&
            currentDate.getFullYear() === hourlySale.saleDay.getFullYear() &&
            currentDate.getUTCHours() + 7 < hourlySale.saleHour + 6 &&
            currentDate.getUTCHours() + 7 >= hourlySale.saleHour
          ) {
            hourlySale.saleCount =
              hourlySale.saleCount + orderInfo.products[i].quantity;
            hourlySale.save();
          }
        });

        product.stock.forEach((item, index) => {
          if (item.color === color && item.size === size) {
            product.stock[index] = {
              ...product.stock[index],
              quantity:
                product.stock[index].quantity - orderInfo.products[i].quantity,
            };
          }
        });
        product.sold = product.sold + orderInfo.products[i].quantity;
        await product.save();
        const indexProduct = existingCart.products.findIndex(
          (product) =>
            product.productId.toString() === productId.toString() &&
            product.size === size &&
            product.color === color
        );
        existingCart.products.splice(indexProduct, 1);
      }

      await existingCart.save();
      newOrder.expireAt = null;
      await newOrder.save();
      return res.status(200).json(newOrder);
    } catch (error) {
      return res.status(500).json({
        message:
          "An error occurs while creating order. Please try again later!",
      });
    }
  },
  createUrlVnPay: async (req, res, next) => {
    try {
      const { amount, bankCode, language, orderInfo } = req.body;
      const userId = req._id;
      const user = await User.findOne({ _id: userId });
      if (!user) {
        return res.status(404).json({ message: "This user does not exist" });
      }
      const newOrder = new Order(orderInfo);
      newOrder.userId = userId;
      newOrder.status = "Chờ xác nhận";
      const existingCart = await cartModel.findOne({ userId: userId });
      if (!existingCart) {
        return res.status(404).json({
          message: "Cart not exist!",
        });
      }
      for (let i = 0; i < orderInfo.products.length; i++) {
        const currentDate = new Date();
        const productId = orderInfo.products[i].productId;
        const color = orderInfo.products[i].color;
        const size = orderInfo.products[i].size;
        const product = await Product.findOne({ _id: productId });
        const hourlySales = await HourlySale.find({ productId: productId });
        hourlySales?.forEach((hourlySale, index) => {
          if (
            currentDate.getDate() === hourlySale.saleDay.getDate() &&
            currentDate.getMonth() === hourlySale.saleDay.getMonth() &&
            currentDate.getFullYear() === hourlySale.saleDay.getFullYear() &&
            currentDate.getUTCHours() + 7 < hourlySale.saleHour + 6 &&
            currentDate.getUTCHours() + 7 >= hourlySale.saleHour
          ) {
            hourlySale.saleCount =
              hourlySale.saleCount + orderInfo.products[i].quantity;

            hourlySale.save();
          }
        });
        product.sold = product.sold + orderInfo.products[i].quantity;
        await product.save();

        const indexProduct = existingCart.products.findIndex(
          (product) =>
            product.productId.toString() === productId.toString() &&
            product.size === size &&
            product.color === color
        );
        existingCart.products.splice(indexProduct, 1);
      }

      //vnpay
      let config = require("../config/vnPay");
      process.env.TZ = "Asia/Ho_Chi_Minh";
      let date = new Date();
      let createDate = moment(date).format("YYYYMMDDHHmmss");
      let ipAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
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
      vnp_Params["vnp_SecureHash"] = signed;
      vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
      await existingCart.save();
      await newOrder.save();
      res.status(201).json({
        newOrder,
        message: "Order created successful!",
        vnpUrl,
      });
    } catch (error) {
      return res.status(500).json({
        message:
          "An error occurs while creating order. Please try again later!",
      });
    }
  },
  createOrderVnPay: async (req, res, next) => {
    try {
      const params = req.body;
      var secureHash = params.vnp_SecureHash;
      let config = require("../config/vnPay");
      var secretKey = config.vnp_HashSecret;
      delete params["vnp_SecureHash"];
      delete params["vnp_SecureHashType"];
      const signedParams = sortObject(params);
      var querystring = require("qs");
      var signData = querystring.stringify(signedParams, { encode: false });
      var crypto = require("crypto");
      var hmac = crypto.createHmac("sha512", secretKey);
      var signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
      if (secureHash === signed) {
        const status = params.vnp_ResponseCode;
        const orderId = params.vnp_TxnRef;
        const userId = req._id;
        const user = await User.findOne({ _id: userId });
        if (!user) {
          return res.status(404).json({ message: "This user does not exist" });
        }
        const order = await Order.findOne({ _id: orderId });
        if (status === "00") {
          order.paid = true;
          delete order.expireAt;
          order.expireAt = null;
          order.status = "Chờ xác nhận";
          await order.save();
          return res.status(200).json({
            order,
            message: "Order created successful!",
            status: "00",
          });
        } else {
          return res
            .status(200)
            .json({ status: "11", Message: "Fail checksum" });
        }
      } else {
        return res
          .status(200)
          .json({ status: params.vnp_ResponseCode, Message: "Fail checksum" });
      }
    } catch (error) {
      return res.status(500).json({
        message:
          "An error occurs while creating order. Please try again later!",
      });
    }
  },
  rePay: async (req, res, next) => {
    try {
      const { bankCode, language, orderId } = req.body;
      const userId = req._id;
      const order = await Order.findOne({ _id: orderId });
      if (!order) {
        return res.status(404).json({ message: "This order does not exist" });
      }
      let amount = order.totalPrice * 1000 * 100;
      //vnpay
      let config = require("../config/vnPay");
      process.env.TZ = "Asia/Ho_Chi_Minh";
      let date = new Date();
      let createDate = moment(date).format("YYYYMMDDHHmmss");
      let ipAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
      let tmnCode = config.vnp_TmnCode;
      let secretKey = config.vnp_HashSecret;
      let vnpUrl = config.vnp_Url;
      let returnUrl = config.vnp_ReturnUrl;

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
      vnp_Params["vnp_SecureHash"] = signed;
      vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
      res.status(200).json({
        message: "RePay link created successful!",
        vnpUrl,
      });
    } catch (error) {
      return res.status(500).json({
        message:
          "An error occurs while creating order. Please try again later!",
      });
    }
  },
  getOrders: async (req, res) => {
    try {
      const userId = req._id;
      const orders = await Order.find({ userId: userId });
      if (!orders) {
        res
          .status(200)
          .json({ orders: [], message: "This user have no order!" });
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
  index: async (req, res, next) => {
    try {
      const { page, limit, userId } = req.query;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      let orders;
      let totalOrders;

      orders = await Order.find({})
        .sort({ createdAt: -1 })
        .skip(startIndex)
        .limit(limit);
      totalOrders = await Order.countDocuments();

      const pagination = {
        currentPage: page,
        totalPages:
          Math.ceil(totalOrders / limit) > 0
            ? Math.ceil(totalOrders / limit)
            : 1,
        totalItems: totalOrders,
        itemsPerPage: limit,
      };

      if (endIndex < totalOrders) {
        pagination.nextPage = page + 1;
      }

      if (startIndex > 0) {
        pagination.prevPage = page - 1;
      }

      res.json({ pagination, data: orders });
    } catch (err) {
      console.error("Lỗi khi truy xuất đơn hàng:", err);
      return next(err);
    }
  },
  getByUserId: async (req, res, next) => {
    try {
      const { page, limit, userId } = req.query;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      console.log(userId);
      let orders = await Order.find({ userId: userId });
      if (!orders) {
        return res
          .status(200)
          .json({ data: [], message: "This user have no order exist!" });
      }
      console.log(orders);

      let totalOrders = orders?.length;

      const pagination = {
        currentPage: page,
        totalPages:
          Math.ceil(totalOrders / limit) > 0
            ? Math.ceil(totalOrders / limit)
            : 1,
        totalItems: totalOrders,
        itemsPerPage: limit,
      };

      if (endIndex < totalOrders) {
        pagination.nextPage = page + 1;
      }

      if (startIndex > 0) {
        pagination.prevPage = page - 1;
      }
      console.log(1);
      return res.status(200).json({
        message: "Order send successful!",
        data: orders,
        pagination,
      });
    } catch (err) {
      console.error("Lỗi khi truy xuất đơn hàng:", err);
      return next(err);
    }
  },
  changeStatus: async (req, res, next) => {
    try {
      const { status, orderId } = req.body;
      let order = await Order.findById(orderId);
      if (!order) {
        return res
          .status(200)
          .json({ data: [], message: "This user have no order exist!" });
      }
      console.log(status);
      order.status = status;
      if (status === "Đã giao" && order.paid == false) {
        order.paid = true;
      }
      await order.save();

      return res.status(200).json({
        message: "Order status changed successfully!",
      });
    } catch (err) {
      console.error("Lỗi khi truy xuất đơn hàng:", err);
      return next(err);
    }
  },
  delete: async (req, res, next) => {
    try {
      const { orderId } = req.query;
      console.log(orderId);
      let order = await Order.findById(orderId);
      if (!order) {
        return res
          .status(200)
          .json({ data: [], message: "This order have no order exist!" });
      }
      await order.deleteOne();
      console.log(1);
      return res.status(200).json({
        message: "Order delete changed successfully!",
      });
    } catch (err) {
      console.error("Lỗi khi truy xuất đơn hàng:", err);
      return next(err);
    }
  },
};
