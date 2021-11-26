const BigPromise = require("../middlewares/bigPromise");
const customError = require("../utils/customError");
const User = require("../models/user");
const cookieToken = require("../utils/cookieToken");

exports.signup = BigPromise(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!email || !password || !name)
    return next(new customError("Name, Email and Password are required", 400));

  const user = await User.create({ name, email, password });

  cookieToken(user, res);
});
