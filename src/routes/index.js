const productRouter = require("./product");
const adminRouter = require('./admin');
const siteRouter = require('./site');
function route(app) {
  app.use("/menu", productRouter);

  app.use("/admin", adminRouter);

  app.use("/", siteRouter);
}

module.exports = route;
