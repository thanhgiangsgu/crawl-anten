var express = require("express");
const router = express.Router();

const crawl = require("../App/controller/crawl.js");
router.get("/data", crawl.crawlData);
router.get("/data-detail", crawl.crawlDataDetail);
router.post("/add-categories", crawl.addCategories);
router.get("/download-img", crawl.downloadImg);
router.get("/convert-json-to-csv", crawl.convertJsonToCsv);

module.exports = router;
