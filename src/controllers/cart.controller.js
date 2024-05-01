const cartModel = require("../models/cart.model");
class CartController {
  async index(req, res, next) {
    try {
      const user_id = req._id;
      const cartInfo = await cartModel.findOne({ userId: user_id });

      if (cartInfo) {
        if (cartInfo.products?.length > 0) {
          res.status(200).json({
            totalPrice: cartInfo.totalPrice,
            products: cartInfo.products,
            quantity: cartInfo.products.length,
          });
        } else {
          res.status(200).json({
            totalPrice: 0,
            products: [],
            quantity: 0,
          });
        }
      }
    } catch (err) {
      console.error("Đã có lỗi xảy ra ", err);
      return res.status(500).json({ error: "Đã có lỗi xảy ra" });
    }
  }

  async store(req, res, next) {
    try {
      const cartInfo = req.body;
      const userId = req._id;

      const existingCart = await cartModel.findOne({ userId: userId });

      if (!existingCart) {
        const newCart = new cartModel({
          userId: userId,
          totalPrice: cartInfo.products.price * cartInfo.products.quantity,
          products: [cartInfo.products],
        });

        newCart
          .save()
          .then(() => {
            res.status(201).json({
              message: "Đã thêm sản phẩm vào giỏ",
              quantity: 1,
            });
          })
          .catch((err) => {
            console.error("Đã có lỗi khi thêm vào giỏ ", err);
            res.status(500).json({ error: "Đã xảy ra lỗi khi thêm vào giỏ" });
          });
      } else {
        const existingProduct = existingCart.products.findIndex(
          (product) => product.productId.toString() === cartInfo.products.productId.toString() && product.size === cartInfo.products.size && product.color === cartInfo.products.color
        );
        if (existingProduct !== -1) {
          existingCart.products[existingProduct].quantity += parseInt(cartInfo.products.quantity);
          existingCart
            .save()
            .then(() => {
              res.status(201).json({
                message: "Đã thêm sản phẩm vào giỏ",
                quantity: existingCart.products.length,
              });
            })
            .catch((err) => {
              console.error("Đã có lỗi khi thêm vào giỏ ", err);
              res.status(500).json({ error: "Đã xảy ra lỗi khi thêm vào giỏ" });
            });
        } else {
          existingCart.products.push(cartInfo.products);
          existingCart.totalPrice += cartInfo.products.price * cartInfo.products.quantity;
          existingCart
            .save()
            .then(() => {
              res.status(201).json({
                message: "Đã thêm sản phẩm vào giỏ",
                quantity: existingCart.products.length,
              });
            })
            .catch((err) => {
              console.error("Đã có lỗi khi thêm vào giỏ ", err);
              res.status(500).json({ error: "Đã xảy ra lỗi khi thêm vào giỏ" });
            });
        }
      }
    } catch (err) {
      console.error("Đã có lỗi khi thêm vào giỏ ", err);
      return res.status(500).json({ error: "Đã xảy ra lỗi khi thêm vào giỏ" });
    }
  }

  async delete(req, res, next) {
    try {
      const { productId, color, size } = req.body;
      const userId = req._id;

      const existingCart = await cartModel.findOne({ userId: userId });

      const indexProduct = existingCart.products.findIndex((product) => product.productId.toString() === productId.toString() && product.size === size && product.color === color);

      existingCart.products.splice(indexProduct, 1);
      existingCart
        .save()
        .then(() => {
          res.status(200).json({
            message: "Đã xóa sản phẩm khỏi giỏ hàng",
            quantity: existingCart.products.length,
          });
        })
        .catch((err) => {
          console.error("Đã có lỗi khi xóa khỏi giỏ ", err);
          return res.status(500).json({ error: "Đã xảy ra lỗi khi xóa khỏi giỏ" });
        });
    } catch (err) {
      console.error("Đã có lỗi khi xóa khỏi giỏ ", err);
      return res.status(500).json({ error: "Đã xảy ra lỗi khi xóa khỏi giỏ" });
    }
  }

  async deleteAll(req, res, next) {
    try {
      const userId = req._id;

      cartModel
        .deleteOne({ userId: userId })
        .then(() => {
          res.status(200).json({
            message: "Đã xóa tất cả sản phẩm khỏi giỏ hàng",
            quantity: 0,
          });
        })
        .catch((err) => {
          console.error("Đã có lỗi khi xóa khỏi giỏ ", err);
          return res.status(500).json({ error: "Đã xảy ra lỗi khi xóa khỏi giỏ" });
        });
    } catch (err) {
      console.error("Đã có lỗi khi xóa khỏi giỏ ", err);
      return res.status(500).json({ error: "Đã xảy ra lỗi khi xóa khỏi giỏ" });
    }
  }

  async deleteMany(req, res, next) {
    try {
      const data = req.body;
      const userId = req._id;

      const existingCart = await cartModel.findOne({ userId: userId });

      for (let item of data) {
        const indexProduct = existingCart.products.findIndex((product) => product.productId.toString() === item.productId.toString() && product.size === item.size && product.color === item.color);

        existingCart.products.splice(indexProduct, 1);
      }

      existingCart
        .save()
        .then(() => {
          res.status(200).json({
            message: "Đã xóa sản phẩm khỏi giỏ hàng",
            quantity: existingCart.products.length,
          });
        })
        .catch((err) => {
          console.error("Đã có lỗi khi xóa khỏi giỏ ", err);
          return res.status(500).json({ error: "Đã xảy ra lỗi khi xóa khỏi giỏ" });
        });
    } catch (err) {
      console.error("Đã có lỗi khi xóa khỏi giỏ ", err);
      return res.status(500).json({ error: "Đã xảy ra lỗi khi xóa khỏi giỏ" });
    }
  }

  async updateQuantity(req, res, next) {
    const { productId, color, size, quantity } = req.body;
    const userId = req._id;

    const existingCart = await cartModel.findOne({ userId: userId });

    const indexProduct = existingCart.products.findIndex((product) => product.productId.toString() === productId.toString() && product.size === size && product.color === color);
    existingCart.products[indexProduct].quantity = quantity;
    existingCart
      .save()
      .then(() => {
        res.status(200).json({
          message: "Đã cập nhật số lượng",
          quantity: existingCart.products[indexProduct].quantity,
        });
      })
      .catch((err) => {
        console.error("Đã có lỗi cập nhật số lượng ", err);
        res.status(500).json({ error: "Đã xảy ra lỗi cập nhật số lượng" });
      });
  }
}

module.exports = new CartController();
