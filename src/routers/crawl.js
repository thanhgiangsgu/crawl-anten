var express = require("express");
const router = express.Router();

const crawl = require("../App/controller/crawl.js");
router.get("/data", crawl.crawlData);
router.get("/data-detail", crawl.crawlDataDetail);

module.exports = router;
