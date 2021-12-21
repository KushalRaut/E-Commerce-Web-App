const express = require("express");
const router = express.Router();

const {
  getProducts,
  newProduct,
  getOneProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getAllReviews,
  deleteReview,
} = require("../controllers/productController");

const { isAuthenticatedUser, authorizedRoles } = require("../middlewares/auth");

router.route("/products").get(getProducts);
router.route("/product/:id").get(getOneProduct);
router
  .route("/admin/product/new")
  .post(isAuthenticatedUser, authorizedRoles("admin"), newProduct);
router.route("/admin/product/:id").put(authorizedRoles("admin"), updateProduct);
router
  .route("/admin/product/:id")
  .delete(authorizedRoles("admin"), deleteProduct);
router.route("/review").put(isAuthenticatedUser, createProductReview);
router
  .route("/reviews")
  .get(isAuthenticatedUser, getAllReviews)
  .delete(isAuthenticatedUser, deleteReview);

module.exports = router;
