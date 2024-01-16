const data = require("./crawl");

function route(app) {
  app.use("/crawl", data);
}

module.exports = route;
