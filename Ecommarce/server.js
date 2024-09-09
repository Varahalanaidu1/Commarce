const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const swaggerConfig = require("./config/swagger");

//Import routes
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");

//Middleware
const app = express();
app.use(express.json());
dotenv.config();

//Swagger setup
app.use(
  "/api-docs",
  swaggerConfig.swaggerUi.serve,
  swaggerConfig.swaggerUi.setup(swaggerConfig.specs)
);

//FS Module
app.use("/public", express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 9090;

//Database connection
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

//Routes
app.use("/api/user", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);

//Server connection
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
