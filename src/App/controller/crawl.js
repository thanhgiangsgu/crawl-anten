const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");

class crawl {
  async crawlData(req, res) {
    const url = "https://poynting.tech/antennas/?v=e14da64a5617";

    // Sử dụng Axios để tải nội dung của trang web
    axios
      .get(url)
      .then((response) => {
        // Kiểm tra xem trang web có được tải thành công không
        if (response.status === 200) {
          // Sử dụng Cheerio để phân tích cú pháp HTML
          const $ = cheerio.load(response.data);

          // Truy xuất vào thẻ ul và lấy toàn bộ nội dung
          const ulContent = $("ul.products.columns-4");

          // Mảng để lưu trữ thông tin sản phẩm
          const productsInfo = [];
          const listProductLink = [];

          ulContent.find("li").each((index, liElement) => {
            // Sử dụng $(liElement) để tạo một đối tượng Cheerio từ phần tử li hiện tại
            const li = $(liElement);

            // Truy xuất vào thẻ tbody và lấy toàn bộ dữ liệu bên trong
            // Truy xuất vào thẻ tbody và lấy toàn bộ dữ liệu bên trong thẻ td
            const tdContents = li
              .find("tbody td")
              .map((tdIndex, tdElement) => $(tdElement).text())
              .get();

            // Truy xuất thông tin khác từ thẻ li
            const productName = li
              .find("h2.woocommerce-loop-product__title")
              .text();

            const productLink = li
              .find("a.woocommerce-LoopProduct-link")
              .attr("href");
            listProductLink.push(productLink);
            const productImageSrc = li.find("img").attr("src");

            // // Tạo đối tượng chứa thông tin sản phẩm
            // const productInfo = {
            //   name: productName,
            //   link: productLink,
            //   imageSrc: productImageSrc,
            //   tdContents: tdContents,
            // };

            // // Thêm đối tượng vào mảng
            // productsInfo.push(productInfo);

            // Ghi thông tin sản phẩm vào file txt
            // fs.writeFileSync("output.txt", "", "utf-8"); // Xóa nội dung cũ nếu có
            // productsInfo.forEach((product, index) => {
            //   fs.appendFileSync("output.txt", `Product ${index + 1}:\n`);
            //   fs.appendFileSync("output.txt", `Name: ${product.name}\n`);
            //   fs.appendFileSync("output.txt", `Link: ${product.link}\n`);
            //   fs.appendFileSync(
            //     "output.txt",
            //     `Image Src: ${product.imageSrc}\n`
            //   );
            //   fs.appendFileSync(
            //     "output.txt",
            //     `TD Contents: ${product.tdContents.join(", ")}\n`
            //   );
            //   fs.appendFileSync("output.txt", "-----------------------\n");
            // });

            console.log("Dữ liệu đã được lưu vào file output.txt");
          });

          // Ghi nội dung vào file txt
          // fs.writeFileSync("output.txt", ulContent, "utf-8");
          fs.writeFileSync(
            "list-product-link.txt",
            listProductLink.join("\n"),
            "utf-8"
          );

          console.log("Dữ liệu đã được lưu vào file output.txt");
        } else {
          console.log("Không thể tải trang web.");
        }
      })
      .catch((error) => {
        console.error("Đã có lỗi:", error);
      });
  }

  async crawlDataDetail(req, res) {
    const productsData = [];

    try {
      // Đọc dữ liệu từ file list-product-link
      const productLinks = fs
        .readFileSync("list-product-link.txt", "utf-8")
        .split("\n")
        .filter(Boolean);
      const productDetails = [];

      // Lặp qua từng URL trong danh sách
      for (const productLink of productLinks) {
        // Thực hiện yêu cầu HTTP để lấy nội dung trang web
        const response = await axios.get(productLink);

        // Kiểm tra xem yêu cầu có thành công không
        if (response.status === 200) {
          // Sử dụng Cheerio để phân tích cú pháp HTML
          const $ = cheerio.load(response.data);

          // Truy xuất vào thẻ có class "et_pb_module et_pb_text et_pb_text_3_tb_body productHeading et_pb_text_align_left et_pb_bg_layout_light"
          const fullName = $(
            ".et_pb_module.et_pb_text.et_pb_text_3_tb_body.productHeading.et_pb_text_align_left.et_pb_bg_layout_light div h2"
          ).text();

          const shortName = $(
            ".et_pb_module.et_pb_wc_title.et_pb_wc_title_0_tb_body.et_pb_bg_layout_light div h1"
          ).text();

          const textInner = $(
            ".et_pb_module.et_pb_text.et_pb_text_0_tb_body.et_pb_text_align_center.et_pb_bg_layout_light div"
          ).text();

          // Sử dụng hàm với tham số là class name
          const parameter = $(
            ".et_pb_module.et_pb_text.et_pb_text_4_tb_body.et_pb_text_align_left.et_pb_bg_layout_light div h3"
          ).text();

          const descriptionList = [];
          const descriptionElement = $(
            ".et_pb_module.et_pb_text.et_pb_text_5_tb_body.et_pb_text_align_left.et_pb_bg_layout_light"
          );

          // Kiểm tra xem phần tử có tồn tại không
          if (descriptionElement.length > 0) {
            // Truy xuất vào thẻ ul bên trong phần tử
            const ulElement = descriptionElement.find("ul");

            // Kiểm tra xem thẻ ul có tồn tại không
            if (ulElement.length > 0) {
              // Lặp qua từng thẻ li trong thẻ ul và lấy nội dung
              ulElement.find("li").each((index, liElement) => {
                // Sử dụng $(liElement) để tạo một đối tượng Cheerio từ phần tử li hiện tại
                const li = $(liElement);

                // Lấy nội dung của thẻ li và thêm vào mảng descriptionList
                descriptionList.push(li.text());
              });
            }
          }

          // Join nội dung của mảng descriptionList để tạo thành một chuỗi
          const description = descriptionList.join("\n");

          const productOverview = $(
            ".woocommerce.et-dynamic-content-woo.et-dynamic-content-woo--product_description"
          ).text();

          const productInfo = {
            fullName: fullName,
            shortName: shortName,
            textInner: textInner,
            productLink: productLink,
            parameter: parameter,
            description: description,
            productOverview: productOverview,
          };

          productsData.push(productInfo);

          console.log("Đã thêm sản phẩm ", productInfo);
        } else {
          console.log(`Không thể truy cập URL: ${productLink}`);
        }
      }

      // Chuyển đổi mảng thành chuỗi JSON
      const jsonData = JSON.stringify(productsData, null, 2); // Tham số null và 2 để có định dạng và thụt lề đẹp

      // Ghi chuỗi JSON vào tệp
      fs.writeFileSync("output.json", jsonData, "utf-8");

      res.json(productDetails);
    } catch (error) {
      console.error("Đã có lỗi:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

module.exports = new crawl();
