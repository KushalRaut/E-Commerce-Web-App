const Product = require("../models/product");
const APIFeatures = require("../utils/apiFeatures");

exports.newProduct = async (req, res, next) => {
  req.body.user = req.user.id;
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
};

exports.getProducts = async (req, res, next) => {
  const resultsPerPage = 4;
  const totalProducts = await Product.count();
  console.log(totalProducts);

  const apiFeatures = new APIFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultsPerPage);

  const product = await apiFeatures.query;

  res.status(200).json({
    success: true,
    count: product.length,
    product,
  });
};

exports.getOneProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  res.status(200).json({
    success: true,
    product,
  });
};

exports.updateProduct = async (req, res, next) => {
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
};

exports.deleteProduct = async (req, res, next) => {
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
};
