const express = require("express");
const app = express();
const port = 3002;
const route = require("./src/routers");
const bodyParser = require("body-parser");
const cors = require("cors"); // Import thư viện CORS

// Sử dụng middleware CORS
app.use(cors());

app.use(bodyParser.json());

app.get("/trang-chu", (req, res) => {
  return res.send("Hello World!");
});

route(app);

app.listen(port, () =>
  console.log("Example app listening at localhost port " + port)
);
