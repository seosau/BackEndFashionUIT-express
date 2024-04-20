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
}

module.exports = new BlogController();
