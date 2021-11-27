const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const BigPromise = require("../middlewares/bigPromise");
const customError = require("../utils/customError");
const User = require("../models/user");
const cookieToken = require("../utils/cookieToken");
const emailHelper = require("../utils/emailHelper");

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

exports.forgotPassword = BigPromise(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) return next(new customError("User not found", 400));

  const forgotToken = user.getForgotPasswordToken();

  user.save({ validateBeforeSave: false });

  const url = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a request to: \n\n ${url}`;

  try {
    await emailHelper({ email, subject: "Reset Password", message });

    res.status(200).json({
      success: true,
      message: "Email sent",
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    user.save({ validateBeforeSave: false });

    return next(new customError("There was an error sending the email", 500));
  }
});

exports.resetPassword = BigPromise(async (req, res, next) => {
  const token = req.params.token;

  const encryptedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: encryptedToken,
    forgotPasswordExpiry: {
      $gt: Date.now(),
    },
  });

  if (!user) return next(new customError("Invalid Token", 400));

  if (req.body.password !== req.body.confirmPassword) {
    return next(new customError("Passwords does not match", 400));
  }

  user.password = req.body.password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save();

  cookieToken(user, res);
});

exports.getLoggedInUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

exports.changePassword = BigPromise(async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findById(userId).select("+password");

  const isCorrectOldPassword = await user.isCorrectPassword(
    req.body.oldPassword
  );

  if (!isCorrectOldPassword)
    return next(new customError("Incorrect old password", 400));

  user.password = req.body.newPassword;
  await user.save();

  cookieToken(user, res);
});

exports.updateUser = BigPromise(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.files.photo !== "") {
    const user = await User.findById(req.user.id);
    const photoId = user.photo.id;
    const resp = await cloudinary.uploader.destroy(photoId);
    const result = await cloudinary.uploader.upload(
      req.files.photo.tempFilePath,
      {
        folder: "users",
        width: 150,
        crop: "scale",
      }
    );

    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!user) return next(new customError("User not found", 400));

  await user.save();

  cookieToken(user, res);
});
