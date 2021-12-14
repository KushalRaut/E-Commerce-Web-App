const Order = require("../models/order");
const Product = require("../models/product");

exports.newOrder = async (req, res, next) => {
  const {
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
  } = req.body;

  const order = await Order.create({
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(200).json({ success: true, order });
};

// Get Single Order /api/v1/order/:id
exports.getOneOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(
      res.status(404).json({ success: false, message: "No order found" })
    );
  }

  res.status(200).json({ success: true, order });
};

// Get logged in user Order /api/v1/orders/me
exports.myOrders = async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id });

  res.status(200).json({ success: true, orders });
};

// Get all the Orders /api/v1/admin/orders/
exports.allOrders = async (req, res, next) => {
  const orders = await Order.find({});

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({ success: true, totalAmount, orders });
};

//Update orders /api/v1/admin/order/:id
exports.updateOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      res.status(404).json({ success: false, message: "No order found" })
    );
  }

  if (order.orderStatus === "Delivered") {
    return next(
      res.status(400).json({
        success: false,
        message: "The order has already been delivered",
      })
    );
  }

  order.orderItems.forEach(async (item) => {
    await updateStock(item.product, item.quantity);
  });

  order.orderStatus = req.body.orderStatus;
  order.deliveredAt = Date.now();

  await order.save();

  res.status(200).json({ success: true, order });
};

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.stock = product.stock - quantity;

  await product.save({ validateBeforeSave: false });
}

//Delete order => /api/v1/admin/order/:id
exports.deleteOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      res.status(404).json({ success: false, message: "No order found" })
    );
  }

  order.remove();

  res.status(200).json({ success: true, message: "Order was deleted successfully"});
};
