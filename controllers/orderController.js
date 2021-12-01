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

exports.adminGetAllOrders = BigPromise(async (req, res, next) => {
  const orders = await Order.find();

  if (!orders) return next(new customError("Orders not found", 404));

  res.status(200).json({
    success: true,
    orders,
  });
});

exports.adminUpdateOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findByIde(req.params.id);

  if (!order) return next(new customError("Order not found", 404));

  if (order.orderStatus === "Delivered")
    return next(new customError("Order already delivered", 400));

  order.orderStatus = req.body.orderStatus;

  order.orderItems.forEach(async (p) => {
    await updateProductStock(p.product, p.quantity);
  });

  await order.save();

  res.status(200).json({
    success: true,
    order,
  });
});

exports.adminDeleteOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) return next(new customError("Order not found", 404));

  await order.remove();

  res.status(200).json({
    success: true,
  });
});

const updateProductStock = async (productId, quantity) => {
  const product = await Product.findById(productId);

  product.stock -= quantity;

  await product.save({
    validateBeforeSave: false,
  });
};
