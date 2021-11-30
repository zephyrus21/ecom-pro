const express = require("express");
const router = express.Router();

const {
  testProduct,
  addProduct,
  getProducts,
} = require("../controllers/productController");
const { isLoggedIn, customRole } = require("../middlewares/user");

router.route("/products").get(getProducts);
router
  .route("/admin/product/add")
  .post(isLoggedIn, customRole("admin"), addProduct);

module.exports.product = router;
