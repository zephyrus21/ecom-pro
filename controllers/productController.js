const cloudinary = require("cloudinary").v2;
const BigPromise = require("../middlewares/bigPromise");
const customError = require("../utils/customError");
const WhereClause = require("../utils/whereClause");
const Product = require("../models/product");

exports.addProduct = BigPromise(async (req, res, next) => {
  let imageArray = [];

  if (!req.files) return next(new customError("No file uploaded", 400));

  if (req.files) {
    //? If there are multiple files then upload it one by one
    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );

      //? also save the url in an array
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

  const productsObj = new WhereClause(Product.find(), req.query)
    .search()
    .filter();

  let products = await productsObj.base;
  const filteredProductsNumber = products.length;

  productsObj.pager(resultPerPage);
  products = await productsObj.base.clone();

  res.status(200).json({
    status: "success",
    products,
    totalProductsNumber,
    filteredProductsNumber,
  });
});