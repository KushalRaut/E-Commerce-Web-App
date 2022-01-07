const Product = require("../models/product");
const APIFeatures = require("../utils/apiFeatures");

const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

exports.newProduct = catchAsyncErrors(async (req, res, next) => {
  req.body.user = req.user.id;
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});

exports.getProducts = catchAsyncErrors(async (req, res, next) => {
  const resultsPerPage = 8;
  const productsCount = await Product.count();

  const apiFeatures = new APIFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultsPerPage);

  const products = await apiFeatures.query;

  res.status(200).json({
    success: true,
    productsCount,
    resultsPerPage,
    ratings: products.ratings,
    products,
  });
});

exports.getOneProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    message: "updated successfully",
    product,
  });
});

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "the product was not found",
    });
  } else {
    await product.deleteOne();
    res.status(200).json({
      success: true,
      message: "The product was deleted successfully",
    });
  }
});

//create new review => /api/v1/review

exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { ratings, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(ratings),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find((r) => {
    r.user.toString() === req.user._id.toString();
  });

  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = ratings;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({ success: true });
});

// Get product reviews => /api/v1/reviews
exports.getAllReviews = catchAsyncErrors(async (req, res, next) => {
  const productId = req.query.id;

  const product = await Product.findById(productId);

  if (!product) {
    return next(
      res.status(404).json({ success: false, message: "Product not found" })
    );
  }

  res.status(200).json({ success: true, reviews: product.reviews });
});

// Delete Product Review   =>   /api/v1/reviews
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  console.log(product);

  const reviews = product.reviews.filter(
    (review) => review._id.toString() !== req.query.id.toString()
  );

  const numOfReviews = reviews.length;

  const ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  console.log(reviews, numOfReviews);
  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    success: true,
  });
});
