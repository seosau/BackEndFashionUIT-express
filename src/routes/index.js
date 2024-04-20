const adminRouter = require("./admin.route.js");
const siteRouter = require("./site.route.js");
const path = require("path");

function route(app) {
  app.use("/api/admin", adminRouter);
  app.use("/api", siteRouter);
}

module.exports = route;
