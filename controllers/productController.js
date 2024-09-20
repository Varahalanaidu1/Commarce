const Product = require("../models/Product");
const Variant = require("../models/Variant");
const variant = require("../models/Variant");

const createProducts = async (req, res) => {
  // #swagger.tags = ['Product']
  const { name, price, description, categoryId, variants } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Set imageUrl
    req.body["imageUrl"] = `/public/uploads/${req.file.filename}`;

    // Create and save product
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();

    // If variants are provided, create them
    if (variants && Array.isArray(variants)) {
      for (const variantData of variants) {
        const { size, color, stock } = variantData;

        const newVariant = new Variant({
          product: savedProduct._id,
          size,
          color,
          stock,
        });

        const savedVariant = await newVariant.save();

        // Update product with variant IDs
        await Product.findByIdAndUpdate(
          savedProduct._id,
          { $push: { variants: savedVariant._id } }, // Push variant ID
          { new: true }
        );
      }
    }

    res.status(201).json(savedProduct);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getProducts = async (req, res) => {
  // #swagger.tags = ['Product']
  try {
    // Fetch products with populated variants
    const products = await Product.find()
      .populate("variants") // Populate variants array directly
      .exec();

    // Format the response
    const formattedProducts = products.map((product) => ({
      _id: product._id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      variants: product.variants.map((variant) => ({
        _id: variant._id,
        size: variant.size,
        color: variant.color,
        stock: variant.stock,
        files: variant.files || [], // Ensure files is an array
      })),
    }));

    res.status(200).json({
      success: true,
      products: formattedProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching products",
        error: error.message,
      });
  }
};
const getProductById = async (req, res) => {
  // #swagger.tags = ['Product']
  const { id } = req.params;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};
const updateProducts = async (req, res) => {
  // #swagger.tags = ['Product']
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Check if a new file is uploaded
    if (req.file) {
      updateData.imageUrl = `/public/uploads/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};
const deleteProducts = async (req, res) => {
  // #swagger.tags = ['Product']
  const { id } = req.params;

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

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
