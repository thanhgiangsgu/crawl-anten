const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
const path = require("path");
const util = require("util");
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const ExcelJS = require("exceljs");

const { HttpsProxyAgent } = require("https-proxy-agent");

class pasternack {
  async crawlDataDetail(req, res) {
    try {
      const url =
        "https://www.pasternack.com/wide-antenna-25-dbi-gain-n-pe51pd1001-p.aspx";
      const response = await axios.get(url);
      const html = response.data;
      console.log(html);
      const $ = cheerio.load(html);

      const Key_Specifications = {};
      $(".pd-description-content table tr").each((index, element) => {
        const key = $(element).find("td:nth-child(1)").text().trim();
        const value = $(element).find("td:nth-child(2)").text().trim();
        if (key !== "Key Specifications.") {
          // Loại bỏ mục "Key Specifications."
          Key_Specifications[key] = value;
        }
      });
      const description = $(".pd-description-content p").text();

      res.json({ Key_Specifications, description });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async crawlDataAllDetail(req, res) {
    // const userAgent =
    //   "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0";
    try {
      const html = await fs.promises.readFile("htmlfile.html", "utf8"); // Sử dụng fs.promises.readFile thay vì fs.readFile

      const $ = cheerio.load(html);

      const SKU = $(".product-id")
        .text()
        .replace("Product ID: ", "")
        .trim()
        .replace(/\s+/g, " ");

      const Name = $(".product-name h1").text().trim().replace(/\s+/g, " ");

      // Khởi tạo một mảng để lưu trữ tất cả các src của thẻ img
      const listImg = [];
      // Tạo thư mục nếu chưa tồn tại
      // if (!fs.existsSync(SKU)) {
      //   fs.mkdirSync(SKU);
      // }

      // Lặp qua tất cả các thẻ img trong class "slick-list"
      $(".slick-list img").each(async (index, element) => {
        const src = $(element).attr("src");

        const url = `https://www.pasternack.com${src}`;
        listImg.push(url);
        // const imageFileName = `${SKU}_${index}.jpg`;
        // const imagePath = path.join(SKU, imageFileName);

        // try {
        //   const response = await axios({
        //     url: url,
        //     method: "GET",
        //     responseType: "stream",
        //     // headers: {
        //     //   "User-Agent": userAgent,
        //     // },
        //   });

        //   const writer = fs.createWriteStream(imagePath);
        //   response.data.pipe(writer);

        //   return new Promise((resolve, reject) => {
        //     writer.on("finish", resolve);
        //     writer.on("error", reject);
        //   });
        // } catch (error) {
        //   console.error(`Error downloading image: ${url}`);
        // }
      });

      const href = $(".pd-sheet-wrap-inner a").attr("href");
      const pdf = `https://www.pasternack.com${href}`;

      const Key_Specifications = {};
      $(".pd-description-content table tr").each((index, element) => {
        const key = $(element).find("td:nth-child(1)").text().trim();
        const value = $(element).find("td:nth-child(2)").text().trim();

        // Kiểm tra xem khóa có chứa chuỗi không mong muốn không
        if (!key.includes("Key Specifications")) {
          Key_Specifications[key] = value;
        }
      });

      // Tạo một đối tượng để lưu trữ thông tin
      const pricingInfo = {};

      // Lặp qua từng hàng trong bảng và lấy thông tin
      $(".pd-option-box-pricing table tbody tr").each((index, element) => {
        const quantity = $(element).find("td:nth-child(1)").text().trim();
        let price = $(element).find("td:nth-child(2)").text().trim();

        if (quantity !== "Quantity") {
          // Kiểm tra xem giá trị có phải là số không
          const numericPrice = parseFloat(
            price.replace("$", "").replace(",", "")
          );
          // Kiểm tra nếu giá trị là một số hợp lệ
          if (!isNaN(numericPrice)) {
            price = numericPrice; // Chuyển đổi thành số
          } else {
            price = "over"; // Nếu không phải là số, sử dụng "over"
          }
          // Gán giá trị vào pricingInfo
          pricingInfo[quantity] = price;
        }
      });
      const pricingArray = Object.entries(pricingInfo).map(
        ([quantity, price]) => ({ Quantity: quantity, Price: price })
      );
      const description = $(".pd-description-content p")
        .text()
        .replace(/\n                  (?!\n)/g, ""); // Loại bỏ các "\n" đơn lẻ

      const newData = {
        SKU,
        Name,
        listImg,
        pdf,
        Key_Specifications,
        pricingArray,
        description,
      };
      // Đọc nội dung hiện tại của file JSON
      let jsonData = [];
      try {
        const fileContent = fs.readFileSync("data_final.json", "utf8");
        jsonData = JSON.parse(fileContent);
      } catch (error) {
        console.error("Error reading file:", error);
      }

      // Thêm dữ liệu mới vào nội dung đó
      jsonData.push(newData);

      // Ghi nội dung đã cập nhật vào file JSON
      try {
        fs.writeFileSync("data_final.json", JSON.stringify(jsonData, null, 2));
        console.log("Data added to file successfully.");
        res.json({ success: true, newData });
      } catch (error) {
        console.error("Error writing file:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async createExcelFile(req, res) {
    const data = require("./data_final.json");
    // Tạo một workbook mới
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Products");

    // Định dạng các cột
    worksheet.columns = [
      { header: "SKU", key: "SKU", width: 15 },
      { header: "Name", key: "Name", width: 50 },
      { header: "Image 1", key: "Image1", width: 50 },
      { header: "Image 2", key: "Image2", width: 50 },
      { header: "Image 3", key: "Image3", width: 50 },
      { header: "Image 4", key: "Image4", width: 50 },
      { header: "PDF", key: "PDF", width: 50 },
      { header: "Antenna Type", key: "AntennaType", width: 20 },
      { header: "Polarization", key: "Polarization", width: 20 },
      { header: "Connector 1 Polarity", key: "Connector1Polarity", width: 20 },
      { header: "Connector Series", key: "ConnectorSeries", width: 20 },
      { header: "Connector Gender", key: "ConnectorGender", width: 20 },
      { header: "Impedance", key: "Impedance", width: 20 },
      { header: "Maximum Input VSWR", key: "MaximumInputVSWR", width: 20 },
      { header: "Price 1-24", key: "Price1_24", width: 20 },
      { header: "Price 25-49", key: "Price25_49", width: 20 },
      { header: "Price 50-99", key: "Price50_99", width: 20 },
      { header: "Price 100-249", key: "Price100_249", width: 20 },
      { header: "Price 250+", key: "Price250", width: 20 },
      { header: "Description", key: "Description", width: 50 },
    ];

    // Thêm dữ liệu vào worksheet
    data.forEach((product) => {
      const row = {
        SKU: product.SKU,
        Name: product.Name,
        Image1: product.listImg[0] || "",
        Image2: product.listImg[1] || "",
        Image3: product.listImg[2] || "",
        Image4: product.listImg[3] || "",
        PDF: product.pdf || "",
        AntennaType: product.Key_Specifications["Antenna Type"] || "",
        Polarization: product.Key_Specifications["Polarization"] || "",
        Connector1Polarity:
          product.Key_Specifications["Connector 1 Polarity"] || "",
        ConnectorSeries: product.Key_Specifications["Connector Series"] || "",
        ConnectorGender: product.Key_Specifications["Connector Gender"] || "",
        Impedance: product.Key_Specifications["Impedance"] || "",
        MaximumInputVSWR:
          product.Key_Specifications["Maximum Input VSWR"] || "",
        Price1_24: product.pricingArray[0]?.Price || "",
        Price25_49: product.pricingArray[1]?.Price || "",
        Price50_99: product.pricingArray[2]?.Price || "",
        Price100_249: product.pricingArray[3]?.Price || "",
        Price250: product.pricingArray[4]?.Price || "",
        Description: product.description || "",
      };
      worksheet.addRow(row);
    });

    // Lưu workbook thành file Excel
    const filePath = "data_final.xlsx";
    await workbook.xlsx.writeFile(filePath);
    console.log(`Excel file saved as: ${filePath}`);
  }
}

module.exports = new pasternack();
