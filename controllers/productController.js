const cloudinary = require("cloudinary").v2;
const BigPromise = require("../middlewares/bigPromise");
const customError = require("../utils/customError");
const WhereClause = require("../utils/whereClause");
const Product = require("../models/product");

exports.addProduct = BigPromise(async (req, res, next) => {
  let imageArray = [];

  if (!req.files) return next(new customError("No file uploaded", 400));

  if (req.files) {
    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );
      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = imageArray;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(201).json({
    status: "success",
    product,
  });
});

exports.getProducts = BigPromise(async (req, res, next) => {
  const resultPerPage = 6;

  const totalProductsNumber = await products.countDocuments();

  let products = new WhereClause(Product.find(), req.query).search().filter();

  const filteredProductsNumber = products.length;

  products.pager(resultPerPage);
  products = await products.base;

  res.status(200).json({
    status: "success",
    products,
    totalProductsNumber,
    filteredProductsNumber,
  });
});
