const BigPromise = require("../middlewares/bigPromise");
const customError = require("../utils/customError");
const Order = require("../models/order");
const Product = require("../models/product");

exports.createOrder = BigPromise(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    order,
  });
});

exports.getOneOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) return next(new customError("Order not found", 404));

  res.status(200).json({
    success: true,
    orders,
  });
});

exports.getLoggedInOrders = BigPromise(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  if (!orders) return next(new customError("Orders not found", 404));

  res.status(200).json({
    success: true,
    orders,
  });
});
