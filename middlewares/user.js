const User = require("../models/user");
const BigPromise = require("./bigPromise");
const CustomError = require("../utils/customError");
const jwt = require("jsonwebtoken");

exports.isLoggedIn = BigPromise(async (req, res, next) => {
  const token =
    req.cookies.token || req.headers("Authorization").replace("Bearer ", "");

  if (!token) return next(new CustomError("You are not logged in", 401));

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded.id);

  next();
});

exports.customRole = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role))
      return next(new CustomError("You are not authorized", 403));

    next();
  };
};
