const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "commarce",
      version: "1.0.0",
      description: "API documentation for the E-commerce project",
    },
    servers: [
      {
        url: "http://localhost:9090/api",
        description: "Development server",
      },
    ],
  },
  apis: ["./routes/*.js", "./models/*.js"], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
