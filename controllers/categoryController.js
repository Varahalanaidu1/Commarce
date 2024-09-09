const Category = require("../models/Category");

const createCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    console.log("filePath", req.file);
    req.body["imageUrl"] = `/public/uploads/${req.file.filename}`;
    const newCategory = new Category(req.body);
    const category = await newCategory.save();
    res.status(201).json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  console.log("updateData", updateData);

  try {
    if (req.file) {
      updateData.imageUrl = `/public/uploads/${req.file.filename}`;
    }
    const updateCategory = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updateCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(updateCategory);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  getCategoryById,
};
