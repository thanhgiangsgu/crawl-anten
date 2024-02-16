var express = require("express");
const router = express.Router();

const crawl = require("../App/controller/pasternack.js");

router.get("/data", crawl.crawlDataDetail);
router.get("/all-data", crawl.crawlDataAllDetail);
router.get("/create-excel-file", crawl.createExcelFile);

module.exports = router;
