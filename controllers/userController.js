const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { token } = require("morgan");
const authToken = require("../middleware/authToken");

// Create a new user

const register = async (req, res) => {
  // #swagger.tags = ['User']
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashPassword });
    const savedUser = await user.save();
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(201).json({
      success: true,
      message: "Registered successfully",
      token,
      user,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};
//Login user

const loginUser = async (req, res) => {
  // #swagger.tags = ['User']
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res
      .status(200)
      .json({ success: true, message: "Logged in successfully", token, user });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      success: false,
      message: "Error logging in user",
      error: err.message,
    });
  }
};

const resetPassword = async (req, res) => {
  // #swagger.tags = ['User']
  try {
    const { token, password } = req.body;

    // Verify the token and extract the payload
    const decodedToken = jsonwebtoken.verify(token, process.env.JWT_SECRET);

    // Find the user by ID from the decoded token
    const user = await User.findById(decodedToken.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid token or user not found" });
    }

    // Hash the new password
    user.password = await bcrypt.hash(password, 10);

    // Save the updated user with the new password
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all users
const getUsers = async (req, res) => {
  // #swagger.tags = ['User']
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

// Get a user by ID
const getUserById = async (req, res) => {
  // #swagger.tags = ['User']
  const { id } = req.params;
  try {
    console.log("USER", req.user._id);
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Update a user
const updateUser = async (req, res) => {
  // #swagger.tags = ['User']
  const { id } = req.params;
  const updateData = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  // #swagger.tags = ['User']
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

module.exports = {
  register,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
  resetPassword,
};
