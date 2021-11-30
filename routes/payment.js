const express = require("express");
const {
  sendStripeKey,
  captureStripePayment,
} = require("../controllers/paymentController");
const router = express.Router();

const { isLoggedIn } = require("../middlewares/user");

router.route("/stripekey").get(isLoggedIn, sendStripeKey);
router.route("/payment").post(isLoggedIn, captureStripePayment);

module.exports.payment = router;
