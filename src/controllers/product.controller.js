const Product = require("../models/product.model");
const { convertToSlug, saveImageBase64ToDisk } = require("../utils");
const fs = require("fs");
const path = require("path");

class ProductController {
  async index(req, res, next) {
    try {
      const { page, limit, keyword } = req.query;

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      let products;
      let totalProducts;

      if (keyword !== "null") {
        const regex = new RegExp(keyword, "i"); // Tạo biểu thức chính quy từ keyword, 'i' để không phân biệt chữ hoa chữ thường
        products = await Product.find({
          $or: [
            { name: regex },
            { slug: regex },
            { "category.categoryType": regex }, 
            { "category.categoryDetail": regex }, 
            { "category.sex": regex }, 

          ],
        })
          .skip(startIndex)
          .limit(limit);
        totalProducts = await Product.countDocuments({
          $or: [
            { name: regex },
            { slug: regex },
            { "category.categoryDetail": regex }, 
            { "category.categoryType": regex }, 
            { "category.sex": regex }, 

          ],
        });
      } else {
        // Nếu không có keyword, thực hiện truy vấn thông thường
        products = await Product.find({}).skip(startIndex).limit(limit);
        totalProducts = await Product.countDocuments();
      }

      const pagination = {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalItems: totalProducts,
        itemsPerPage: limit,
      };

      if (endIndex < totalProducts) {
        pagination.nextPage = page + 1;
      }

      if (startIndex > 0) {
        pagination.prevPage = page - 1;
      }

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

      res.json({ pagination, data: updatedProducts });
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
    const productInfo = { ...req.body, slug: convertToSlug(req.body.name) };
    const preProduct = {
      ...productInfo,
      images: productInfo.images.map((image, index) => ({
        color: image.color,
        imgUrl: saveImageBase64ToDisk(
          uploadDirectory,
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
                uploadDirectory,
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
  async delete(req, res, next) {
    const { slug } = req.params;
    await Product.findOne({ slug: slug })
      .then((product) => {
        if (!product) {
          return res.status(404).json({ error: "Sản phẩm không tồn tại" });
        }
        // Xoá từ cơ sở dữ liệu
        Product.deleteOne({ slug: slug })
          .then(() => {
            // Xoá hình ảnh từ thư mục uploads
            product.images.forEach((imagePath) => {
              fs.unlink(imagePath.imgUrl, (err) => {
                if (err) {
                  console.error("Lỗi khi xoá hình ảnh:", err);
                }
              });
            });
            res.status(200).json({ message: "Xoá sản phẩm thành công" });
          })
          .catch((error) => {
            res.status(500).json({ error: "Xoá sản phẩm thất bại" });
          });
      })
      .catch((error) => {
        res.status(500).json({ error: "Lỗi khi truy vấn sản phẩm" });
      });
  }
  async searchProduct(req, res, next) {
    try {
      const products = await Product.aggregate([
        [
          {
            $search: {
              index: "clothes",
              text: {
                query: req.params.keyword,
                path: {
                  wildcard: "*",
                },
              },
            },
          },
        ],
      ]);
      const updatedProducts = products.map((product) => {
        const updatedImages = product.images.map((image) => ({
          color: image.color,
          imgUrl: `http://localhost:8000/uploads/${path.basename(
            image.imgUrl
          )}`,
        }));
        return {
          ...product,
          images: updatedImages,
        };
      });
      res.status(200).json(updatedProducts);
    } catch (error) {
      res.status(500).json("failed to get the products");
    }
  }

  async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      product.images = product.images.map((image) => ({
        color: image.color,
        imgUrl: `http://localhost:8000/uploads/${path.basename(image.imgUrl)}`,
      }));
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ error: "Đã xảy ra lỗi khi tìm sản phẩm" });
    }
  }

  async deleteSelectedProduct(req, res, next) {
    const selectedArr = req.body;
    for (let i = 0; i < selectedArr.length; i++) {
      await Product.findOne({ slug: selectedArr[i] })

        .then((product) => {
          if (!product) {
            return res.status(404).json({ error: "Sản phẩm không tồn tại" });
          }
          // Xoá từ cơ sở dữ liệu
          Product.deleteOne({ slug: selectedArr[i] })
            .then(() => {
              // Xoá hình ảnh từ thư mục uploads
              product.images.forEach((imagePath) => {
                fs.unlink(imagePath.imgUrl, (err) => {
                  if (err) {
                    console.error("Lỗi khi xoá hình ảnh:", err);
                  }
                });
              });
              res.status(200).json({ message: "Xoá sản phẩm thành công" });
            })
            .catch((error) => {
              res.status(500).json({ error: "Xoá sản phẩm thất bại" });
            });
        })
        .catch((error) => {
          res.status(500).json({ error: "Lỗi khi truy vấn sản phẩm" });
        });
    }
  }
}

module.exports = new ProductController();
