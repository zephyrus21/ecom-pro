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
    success: true,
    product,
  });
});

exports.getProducts = BigPromise(async (req, res, next) => {
  const resultPerPage = 6;

  const totalProductsNumber = await Product.countDocuments();

  const productsObj = new WhereClause(Product.find(), req.query)
    .search()
    .filter();

  let products = await productsObj.base;
  const filteredProductsNumber = products.length;

  productsObj.pager(resultPerPage);
  products = await productsObj.base.clone();

  res.status(200).json({
    success: true,
    products,
    totalProductsNumber,
    filteredProductsNumber,
  });
});

exports.getOneProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) return next(new customError("Product not found", 401));

  res.status(200).json({
    success: true,
    product,
  });
});

exports.adminGetProducts = BigPromise(async (req, res, next) => {
  const products = await Product.find();

  if (!products) return next(new customError("No products found", 404));

  res.status(200).json({
    products,
  });
});

exports.adminUpdateProduct = BigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) return next(new customError("Product not found", 404));

  let imageArray = [];

  if (req.files) {
    for (let index = 0; index < product.photos.length; index++) {
      const result = await cloudinary.uploader.destroy(
        product.photos[index].id
      );
    }

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

  product = await product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

exports.adminDeletOneProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) return next(new customError("Product not found", 404));

  for (let index = 0; index < product.photos.length; index++) {
    await cloudinary.uploader.destroy(product.photos[index].id);
  }

  await product.remove();

  res.status(200).json({
    success: true,
    message: "Product deleted",
  });
});

exports.addReview = BigPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const alreadyReviewed = product.reviews.find(
    (review) => review.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed)
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.rating = Number(rating);
        review.comment = comment;
      }
    });
  else {
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save({
    validateBeforeSave: false,
  });

  res.status(200).json({
    success: true,
  });
});

exports.deleteReview = BigPromise(async (req, res, next) => {
  const { productId } = req.query;

  const product = await Product.findById(productId);

  const reviews = product.reviews.filter(
    (review) => review.user.toString() !== req.user._id.toString()
  );

  const numberOfReviews = reviews.length;

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await Product.findByIdAndUpdate(
    productId,
    {
      reviews,
      numberOfReviews,
      ratings: product.ratings,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});

exports.getOneProductReviews = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) return next(new customError("Product not found", 404));

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});
