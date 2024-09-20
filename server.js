const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerConfig = require("./swagger_output.json");

dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json());

// Serve static files
app.use("/public", express.static(path.join(__dirname, "public")));

// Import API routes
const apirouters = require("./routes");
app.use("/api", apirouters.api);

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Serve Swagger UI
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerConfig));

// Start the server
const PORT = process.env.PORT || 9090;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/swagger`);
});
