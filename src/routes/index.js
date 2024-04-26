const adminRouter = require("./admin.route.js");
const siteRouter = require("./site.route.js");
const authRouter = require("./auth.route.js");
const userRouter = require("./user.route.js");
const path = require("path");

function route(app) {
  app.use("/api/admin", adminRouter);
  app.use("/api", siteRouter);
  app.get("/uploads/:imageName", (req, res) => {
    const imageName = req.params.imageName;
    res.sendFile(path.join(__dirname, "..", "uploads", imageName));
  });
  app.use("/api", authRouter);
  app.use("/api", userRouter);
}

module.exports = route;
