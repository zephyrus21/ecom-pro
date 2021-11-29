const express = require("express");
const { testProduct } = require("../controllers/productController");
const router = express.Router();

router.route("/test").get(testProduct);

module.exports.product = router;
