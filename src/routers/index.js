const data = require("./crawl");
const pasternack = require("./pasternack");

function route(app) {
  app.use("/crawl", data);
  app.use("/pasternack", pasternack);
}

module.exports = route;
