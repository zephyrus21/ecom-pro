const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const BigPromise = require("../middlewares/bigPromise");
const customError = require("../utils/customError");
const User = require("../models/user");
const cookieToken = require("../utils/cookieToken");

exports.signup = BigPromise(async (req, res, next) => {
  if (!req.files) return next(new customError("No file uploaded", 400));

  const { name, email, password } = req.body;

  if (!email || !password || !name)
    return next(new customError("Name, Email and Password are required", 400));

  let file = req.files.photo;

  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: "users",
    width: 150,
    crop: "scale",
  });

  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });

  cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new customError("Email and Password are required", 400));

  const user = await User.findOne({ email }).select("+password");

  if (!user) return next(new customError("User not found", 400));

  const isPasswordCorrect = await user.isCorrectPassword(password);

  if (!isPasswordCorrect)
    return next(new customError("Incorrect password", 400));

  cookieToken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
  res.clearCookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).send("Logout successful");
});
