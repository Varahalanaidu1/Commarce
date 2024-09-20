const mongoose = require("mongoose");
const Product = require("../models/Product");
const Variant = require("../models/Variant");

// Create a new variant
const createVariant = async (req, res) => {
  // #swagger.tags = ['Variant']

  try {
    const { product, size, color, stock } = req.body;

    // Validate product ID format
    if (!mongoose.Types.ObjectId.isValid(product)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format." });
    }

    // Ensure the product exists before creating the variant
    const existingProduct = await Product.findById(product);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    // Check if a variant with the same color and size already exists for the product
    const existingVariant = await Variant.findOne({ product, color, size });
    if (existingVariant) {
      return res.status(400).json({
        success: false,
        message: "Variant with this color and size already exists.",
      });
    }

    let fileUrls = [];
    // Check if any files are uploaded
    if (req.files && req.files.length > 0) {
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "application/pdf",
      ];
      for (const file of req.files) {
        if (!allowedTypes.includes(file.mimetype)) {
          return res.status(400).json({
            success: false,
            message: "Invalid file type. Only [png, jpeg, jpg, pdf] are allowed.",
          });
        }
        // Store the file URL
        fileUrls.push(`/public/uploads/${file.filename}`);
      }
    }

    // Create a new variant instance
    const newVariant = new Variant({
      product,
      size,
      color,
      stock,
      files: fileUrls, // Store file URLs in the variant
    });

    const savedVariant = await newVariant.save();

    // Update the product to include the variant ID
    await Product.findOneAndUpdate(
      { _id: product },
      { $push: { variants: savedVariant._id } }, // Push only the variant ID
      { new: true } // Return the updated document
    );

    res.status(201).json({
      success: true,
      variant: savedVariant,
    });
  } catch (error) {
    console.error("Error creating variant:", error);
    res.status(500).json({ success: false, message: "Error creating variant", error: error.message });
  }
};

module.exports = { createVariant };
