const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    maxlength: [50, "Name must be less than 50 characters"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    validate: [validator.isEmail, "Please enter a valid email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false,
  },
  role: {
    type: String,
    default: "user",
  },
  photo: {
    id: {
      type: String,
      required: [true, "Please enter your photo"],
    },
    secure_url: {
      type: String,
      required: true,
    },
  },
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//! encrypt password before saving
//$ can't use arrow function here
userSchema.pre("save", async function (next) {
  //? only run if password is modified
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

//! validate the password with the user password
userSchema.methods.isCorrectPassword = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password);
};

//! generate and return token for user
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

//! generate forgot password token
userSchema.methods.getForgotPasswordToken = function () {
  //? generate a long random string
  const token = crypto.randomBytes(20).toString("hex");

  //? getting a hash - make sure to get a hash in backend
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  //? set expiry
  this.forgotPasswordExpiry = Date.now() + 10 * 60 * 1000;

  return token;
};

module.exports = mongoose.model("User", userSchema);
