const express = require("express");
const router = express.Router();

const {
  addProduct,
  getProducts,
  adminGetProducts,
  getOneProduct,
  adminUpdateProduct,
  adminDeletOneProduct,
  addReview,
  deleteReview,
  getOneProductReviews,
} = require("../controllers/productController");
const { isLoggedIn, customRole } = require("../middlewares/user");

router.route("/products").get(getProducts);
router.route("/products/:id").get(getOneProduct);
router.route("/products/:id/reviews").get(isLoggedIn, getOneProductReviews);
router
  .route("/review")
  .put(isLoggedIn, addReview)
  .delete(isLoggedIn, deleteReview);
router
  .route("/admin/product/add")
  .post(isLoggedIn, customRole("admin"), addProduct);
router
  .route("/admin/products")
  .get(isLoggedIn, customRole("admin"), adminGetProducts);
router
  .route("/admin/products/:id")
  .put(isLoggedIn, customRole("admin"), adminUpdateProduct)
  .delete(isLoggedIn, customRole("admin"), adminDeletOneProduct);

module.exports.product = router;
