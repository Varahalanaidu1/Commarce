const Cart = require("../models/Cart");
const Product = require("../models/Product");
const authenticateToken = require("../middleware/authToken");

// Add item to cart
const addItemToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [], totalPrice: 0 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += parseInt(quantity);
    } else {
      cart.items.push({
        productId: parseInt(productId),
        quantity: parseInt(quantity),
      });
    }

    cart.totalPrice += product.price * quantity;

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
//Cart increase and decrease

const updateCartQuantity = async (req, res) => {
  try {
    const { productId, action } = req.body; // action should be either "increase" or "decrease"
    const userId = req.user._id;

    // Find the user's cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the item in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Find the product to get its price
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Handle the action
    if (action === "increase") {
      cart.items[itemIndex].quantity += 1;
      cart.totalPrice += product.price;
    } else if (action === "decrease") {
      if (cart.items[itemIndex].quantity > 1) {
        cart.items[itemIndex].quantity -= 1;
        cart.totalPrice -= product.price;
      } else {
        // If the quantity is 1, remove the item from the cart
        cart.totalPrice -= product.price;
        cart.items.splice(itemIndex, 1);
      }
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    // Save the updated cart
    await cart.save();

    return res.status(200).json(cart);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server error");
  }
};

// Get cart by token
const getByToken = async (req, res) => {
  try {
    const userId = req.user._id; // Get user ID from token

    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    return res.status(200).json({ success: true, cart });
  } catch (err) {
    console.error(err.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    // Find the cart for the current user
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the index of the item to be updated in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Find the product to get its price
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Calculate the difference in price based on quantity change
    const currentQuantity = cart.items[itemIndex].quantity;
    const quantityDifference = quantity - currentQuantity;

    // Adjust the total price in the cart
    cart.totalPrice += quantityDifference * product.price;

    // Update the item quantity
    cart.items[itemIndex].quantity = quantity;

    // Save the updated cart
    await cart.save();

    return res.status(200).json(cart);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server error");
  }
};

// Remove item from cart
const removeItemFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (itemIndex > -1) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Adjust the total price and remove the item
      cart.totalPrice -= cart.items[itemIndex].quantity * product.price;
      cart.items.splice(itemIndex, 1);

      await cart.save();
      res.status(200).json(cart);
    } else {
      res.status(404).json({ message: "Item not found in cart" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};


module.exports = {
  addItemToCart,
  getByToken,
  updateCartItem,
  removeItemFromCart,
  updateCartQuantity,
};




// changes to test