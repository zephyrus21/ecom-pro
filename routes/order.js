const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOneOrder,
  getLoggedInOrders,
} = require("../controllers/orderController");
const { isLoggedIn, customRole } = require("../middlewares/user");

router.route("/order/create").post(isLoggedIn, createOrder);
router.route("/order/:id").get(isLoggedIn, getOneOrder);
router.route("/myorders").get(isLoggedIn, getLoggedInOrders);

module.exports.order = router;
