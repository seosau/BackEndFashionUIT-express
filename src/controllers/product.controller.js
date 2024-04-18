const Product = require("../models/product.model");
const { convertToSlug } = require("../utils/generateSlug");
const fs = require("fs");
const path = require("path");

class ProductController {
  async index(req, res, next) {
    try {
      const products = await Product.find({});
      const updatedProducts = products.map((product) => {
        const updatedImages = product.images.map((image) => ({
          color: image.color,
          imgUrl: `http://localhost:8000/uploads/${path.basename(
            image.imgUrl
          )}`,
        }));
        return {
          ...product.toObject(),
          images: updatedImages,
        };
      });
      res.json(updatedProducts);
    } catch (err) {
      console.error("Lỗi khi truy xuất sản phẩm:", err);
      return next(err);
    }
  }
  async store(req, res, next) {
    const controllersDirectory = path.join(__dirname, "..");
    const uploadDirectory = path.join(controllersDirectory, "uploads");
    if (!fs.existsSync(uploadDirectory)) {
      fs.mkdirSync(uploadDirectory);
    }

    // Hàm lưu hình ảnh vào thư mục trên máy chủ và trả về đường dẫn của hình ảnh
    function saveImageBase64ToDisk(base64String, fileName) {
      const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, "base64");
      const imagePath = path.join(uploadDirectory, fileName);
      fs.writeFileSync(imagePath, imageBuffer);
      return imagePath;
    }

    const productInfo = { ...req.body, slug: convertToSlug(req.body.name) };
    const preProduct = {
      ...productInfo,
      images: productInfo.images.map((image, index) => ({
        color: image.color,
        imgUrl: saveImageBase64ToDisk(
          image.imgUrl,
          `${productInfo.slug}-${index}.jpg`
        ),
      })),
    };
    const newProduct = await new Product(preProduct);
    newProduct
      .save()
      .then(() => {
        console.log("Tạo sản phẩm thành công");
        res.status(201).json({ success: "Tạo sản phẩm thành công" });
      })
      .catch((err) => {
        console.error("Lỗi khi tạo sản phẩm:", err);
        res.status(500).json({ error: "Đã xảy ra lỗi khi tạo sản phẩm" });
      });
  }
  async getproductbyslug(req, res, next) {
    try {
      const { slug } = req.params;
      const product = await Product.findOne({ slug: slug });
      product.images = product.images.map((image) => ({
        color: image.color,
        imgUrl: `http://localhost:8000/uploads/${path.basename(image.imgUrl)}`,
      }));
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ error: "Đã xảy ra lỗi khi tìm sản phẩm" });
    }
  }
  async update(req, res, next) {
    const controllersDirectory = path.join(__dirname, "..");
    const uploadDirectory = path.join(controllersDirectory, "uploads");
    if (!fs.existsSync(uploadDirectory)) {
      fs.mkdirSync(uploadDirectory);
    }
    function saveImageBase64ToDisk(base64String, fileName) {
      const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, "base64");
      const imagePath = path.join(uploadDirectory, fileName);
      fs.writeFileSync(imagePath, imageBuffer);
      return imagePath;
    }
    const { slug } = req.params;
    const editedProduct = { ...req.body, slug: convertToSlug(req.body.name) };
    const preProduct = {
      ...editedProduct,
      images: [
        ...editedProduct.images.map((image, index) => {
          if (!!image.imgUrl.match(/^data:image\/\w+;base64,/))
            return {
              color: image.color,
              imgUrl: saveImageBase64ToDisk(
                image.imgUrl,
                `${editedProduct.slug}-${index}.jpg`
              ),
            };
          return image;
        }),
      ],
    };
    Product.updateOne({ slug: slug }, preProduct)
      .then((response) => {
        res.status(200).json({ message: "Cập nhật sản phẩm thành công" });
      })
      .catch((error) => {
        res.status(500).json({ message: "Cập nhật sản phẩm thất bại", error });
      });
  }

  delete(req, res, next) {}
}

module.exports = new ProductController();
