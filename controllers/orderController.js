const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const cart = require("../models/Cart");

const createOrder = async (req, res) => {
  const { userId, products } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let totalAmount = 0;
    const productUpdates = [];

    for (let item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for product: ${product.name}`,
        });
      }

      totalAmount += product.price * item.quantity;
      product.stock -= item.quantity;
      productUpdates.push(product.save());
    }

    const order = new Order({
      user: userId,
      products,
      totalAmount,
    });

    const savedOrder = await order.save();
    await Promise.all(productUpdates);

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    });
  }
};

// Get Order by ID
const getOrderByToken = async (req, res) => {
  try {
    const userId = req.user.id;

    const order = await Order.findOne({ user: userId })
      .populate("user")
      .populate("products.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Error retrieving order",
      error: error.message,
    });
  }
};

// Get All Orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("products.product", "name price");

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found",
      });
    }

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Error retrieving orders",
      error: error.message,
    });
  }
};

// Update Order Status by ID
const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;
  const { status } = req.body;

  const validStatuses = ["pending", "shipped", "delivered", "order placed"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order status",
    });
  }

  try {
    // Find the order by its ID and the associated user ID
    const order = await Order.findOne({ _id: orderId });

    // Check if the order exists
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;

    // Save the updated order to the database
    const updatedOrder = await order.save();

    // Return a success response with the updated order
    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrderByToken,
  getAllOrders,
  updateOrderStatus,
};
