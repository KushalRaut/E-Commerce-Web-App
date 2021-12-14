const express = require("express");
const router = express.Router();

const {
  getProducts,
  newProduct,
  getOneProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { isAuthenticatedUser, authorizedRoles } = require("../middlewares/auth");

router.route("/products").get(isAuthenticatedUser, getProducts);
router.route("/product/:id").get(getOneProduct);
router.route("/admin/product/new").post( isAuthenticatedUser, authorizedRoles('admin') ,newProduct);
router.route("/admin/product/:id").put(authorizedRoles('admin'),updateProduct);
router.route("/admin/product/:id").delete(authorizedRoles('admin'),deleteProduct);

module.exports = router;
