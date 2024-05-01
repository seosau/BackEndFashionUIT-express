const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const Blog = require("../models/blog.model");
const { convertToSlug, saveImageBase64ToDisk } = require("../utils");

const parseAndReplaceImages = async (html, fileName) => {
  const $ = cheerio.load(html);
  const controllersDirectory = path.join(__dirname, "..");
  const uploadDirectory = path.join(controllersDirectory, "uploads");
  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory);
  }
  $("img").each((index, element) => {
    const imagePath = $(element).attr("src");
    if (imagePath.match(/^data:image\/\w+;base64,/)) {
      const imageURL = saveImageBase64ToDisk(
        uploadDirectory,
        imagePath,
        `${fileName}-${index}.jpg`
      );

      $(element).attr(
        "src",
        `http://localhost:8000/uploads/${path.basename(imageURL)}`
      );
    }
  });

  return $.html();
};

class BlogController {
  async index(req, res, next) {
    try {
      const blogs = await Blog.find({});
      res.status(200).json(blogs);
    } catch (error) {
      res.status(500).json({ message: "Có lỗi khi truy xuất bài viết" });
    }
  }
  async store(req, res, next) {
    const blog = { ...req.body, slug: convertToSlug(req.body.title) };
    const blogDescWithReplacedImages = await parseAndReplaceImages(
      blog.description,
      blog.slug
    );
    const blogDescWithReplacedImagesCleanedHtml =
      blogDescWithReplacedImages.replace(/<\/?(html|head|body)>/gi, "");
    blog.description = blogDescWithReplacedImagesCleanedHtml;
    const newBlog = await new Blog(blog);
    newBlog
      .save()
      .then((response) => {
        console.log("Tạo bài viết thành công");
        res.status(201).json({ success: "Tạo bài viết thành công" });
      })
      .catch((err) => {
        console.error("Lỗi khi tạo bài viết:", err);
        res.status(500).json({ error: "Đã xảy ra lỗi khi tạo bài viết" });
      });
  }
  async getBlogBySlug(req, res, next) {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug: slug });
    res.status(200).json(blog);
  }
  async searchBlog(req, res, next) {
    try {
      const blogs = await Blog.aggregate([
        [
          {
            $search: {
              index: "blogs",
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
      res.status(200).json(blogs);
    } catch (error) {
      res.status(500).json("failed to get the blogs");
    }
  }
  async update(req, res, next) {
    const { slug } = req.params;
    const blog = { ...req.body, slug: convertToSlug(req.body.title) };
    const blogDescWithReplacedImages = await parseAndReplaceImages(
      blog.description,
      blog.slug
    );
    const blogDescWithReplacedImagesCleanedHtml =
      blogDescWithReplacedImages.replace(/<\/?(html|head|body)>/gi, "");
    blog.description = blogDescWithReplacedImagesCleanedHtml;
    await Blog.updateOne({ slug: slug }, blog)
      .then((response) => {
        res.status(200).json({ message: "Cập nhật tin tức thành công" });
      })
      .catch((error) => {
        res.status(500).json({ message: "Cập nhật tin tức thất bại", error });
      });
  }
  async delete(req, res, next) {
    const { slug } = req.params;
    await Blog.deleteOne({ slug: slug })
      .then((response) => {
        res.status(200).json({ success: "Xoá bài viết thành công" });
      })
      .catch((error) => {
        res.status(500).json({ success: "Xoá bài viết không thành công" });
      });
  }
  async deleteSelectedBlogs(req, res, next) {
    const selectedArr = req.body;
    const deletionPromises = selectedArr.map((slug) => {
      return Blog.deleteOne({ slug });
    });

    try {
      await Promise.all(deletionPromises);
      res.status(200).json({ success: "Xoá bài viết thành công" });
    } catch (error) {
      res.status(500).json({ error: "Xoá bài viết thất bại" });
    }
  }
}

module.exports = new BlogController();
