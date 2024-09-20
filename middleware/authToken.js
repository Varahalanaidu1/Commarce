const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    // Check if the authorization header is present and starts with 'Bearer'
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "JWT must be provided" });
    }

    // Extract the token from the authorization header
    const token = authHeader.split(" ")[1];

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded); // Add logging

    // Verify user existence in the database
    const user = await User.findById(decoded.id).select("-password"); // Exclude password from user data
    console.log(user); // Add logging

    // Attach the user object to the request for further use
    req.user = user;
    next();
  } catch (err) {
    console.error("Error in token verification:", err);
    if (err.name === "TokenExpiredError") {
      return res.status(403).json({ success: false, message: "Token expired" });
    } else {
      return res.status(403).json({ success: false, message: "Invalid token" });
    }
  }
};

module.exports = authenticateToken;
