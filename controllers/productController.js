const Product = require("../models/Product");

// Create a new product
const createProducts = async (req, res) => {
  const { name, price, description, categoryId } = req.body;

  try {
    // Check if a file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Set the imageUrl in the request body
    req.body["imageUrl"] = `/public/uploads/${req.file.filename}`;

    // Create a new product instance with the request body
    const newProduct = new Product(req.body);

    // Save the product to the database
    const product = await newProduct.save();

    // Respond with the created product
    res.status(201).json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update an existing product by ID
const updateProducts = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Check if a new file is uploaded
    if (req.file) {
      updateData.imageUrl = `/public/uploads/${req.file.filename}`;
    }

    // Find the product by ID and update it
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    // If no product is found, return a 404 error
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Respond with the updated product
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a product by ID
const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the product by ID
    const product = await Product.findById(id);

    // If no product is found, return a 404 error
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Respond with the product
    res.status(200).json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all products
const getProducts = async (req, res) => {
  try {
    // Fetch all products from the database
    const products = await Product.find();

    // Respond with the list of products
    res.status(200).json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a product by ID
const deleteProducts = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the product by ID and delete it
    const deletedProduct = await Product.findByIdAndDelete(id);

    // If no product is found, return a 404 error
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Respond with the deleted product
    res.status(200).json(deletedProduct);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProducts,
  updateProducts,
  deleteProducts,
};
