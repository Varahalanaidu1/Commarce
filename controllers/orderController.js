const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const cart = require("../models/Cart");
const jwt = require("jsonwebtoken");
const PDFDocument = require("pdfkit");
const pdf = require("html-pdf");
const fs = require('fs');
const path = require('path');
const util = require('util');
const puppeteer = require('puppeteer');
const hb = require('handlebars');

const createOrder = async (req, res) => {
  // #swagger.tags = ['Order']
  const { userId, products } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let totalAmount = 0;
    const productUpdates = [];

    for (let item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for product: ${product.name}`,
        });
      }

      totalAmount += product.price * item.quantity;
      product.stock -= item.quantity;
      productUpdates.push(product.save());
    }

    const order = new Order({
      user: userId,
      products,
      totalAmount,
    });

    const savedOrder = await order.save();
    await Promise.all(productUpdates);

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    });
  }
};

// Get Order by ID
const getOrderByToken = async (req, res) => {
  // #swagger.tags = ['Order']
  try {
    const userId = req.user.id;

    const order = await Order.findOne({ user: userId })
      .populate("user")
      .populate("products.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Error retrieving order",
      error: error.message,
    });
  }
};

// Get All Orders
const getAllOrders = async (req, res) => {
  // #swagger.tags = ['Order']
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("products.product", "name price");

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found",
      });
    }

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Error retrieving orders",
      error: error.message,
    });
  }
};

// Update Order Status by ID
const updateOrderStatus = async (req, res) => {
  // #swagger.tags = ['Order']
  const { orderId } = req.params;
  const userId = req.user.id;
  const { status } = req.body;

  const validStatuses = ["pending", "shipped", "delivered", "order placed"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order status",
    });
  }

  try {
    // Find the order by its ID and the associated user ID
    const order = await Order.findOne({ _id: orderId });

    // Check if the order exists
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;

    // Save the updated order to the database
    const updatedOrder = await order.save();

    // Return a success response with the updated order
    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message,
    });
  }
};


const readFile = util.promisify(fs.readFile);
// Load HTML template
const getTemplateHtml = async () => {
  console.log("Loading template file in memory");
  try {
    const invoicePath = path.resolve("./view/invoice.html");
    return await readFile(invoicePath, 'utf8');
  } catch (err) {
    return Promise.reject("Could not load html template");
  }
};

// Ensure directory exists
const ensureDirectoryExists = async (directoryPath) => {
  try {
    await fs.promises.mkdir(directoryPath, { recursive: true });
  } catch (err) {
    console.error(`Error creating directory: ${err.message}`);
    throw err;
  }
};

// Generate PDF from HTML template
const generatePdf = async (order) => {
  try {
    const templateHtml = await getTemplateHtml(); // Ensure this fetches the correct invoice.html template

    console.log("Compiling the template with Handlebars");

    // Compile the HTML template with Handlebars
    const template = hb.compile(templateHtml, { strict: true });

    // The `order` object will include the data we want to inject into the template
    const html = template(order);

    // Puppeteer setup
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'], timeout: 60000 });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // File paths
    const pdfFileName = `invoice_${order.invoiceNumber}.pdf`;
    const pdfDirectory = path.join(__dirname, '../assets/invoices');
    const pdfFilePath = path.join(pdfDirectory, pdfFileName);

    await ensureDirectoryExists(pdfDirectory);
    
    // Generate PDF with background printing enabled
    await page.pdf({ path: pdfFilePath, format: 'A4', printBackground: true });

    await browser.close();
    
    console.log("PDF Generated at:", pdfFilePath);
    return { pdfFilePath, relativePdfFilePath: `assets/invoices/${pdfFileName}` };
  } catch (err) {
    console.error("Error generating PDF:", err);
    throw new Error("Failed to generate PDF: " + err.message);
  }
};
// Generate and download the invoice
const getInvoice = async (req, res) => {
  // #swagger.tags = ['Order']
  const { orderId } = req.params;
  
  try {
    // Fetch the order details from the database
    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate("products.product", "description price");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Prepare invoice items and totals
    const invoiceItems = order.products
      .map((product) => {
        if (product.product && product.quantity) {
          const itemTotalPrice = product.product.price * product.quantity;
          return {
            description: product.product.description,
            quantity: product.quantity,
            unitPrice: product.product.price,
            totalPrice: itemTotalPrice,
          };
        }
        return null;
      })
      .filter(Boolean);

    const subtotal = invoiceItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxRate = 10; // 10% tax rate
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    // Prepare invoice data for the template
    const invoiceData = {
      companyName: "Photonx",
      companyAddress: "Photonx Company, HYD, India",
      companyEmail: "info@photonx.com",
      companyPhone: "+91 8987 7867 98",
      customerName: order.user.name,
      customerEmail: order.user.email,
      invoiceNumber: `INV-${orderId}`,
      date: new Date().toLocaleDateString(),
      items: invoiceItems,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
    };

    console.log("Invoice Data:", invoiceData);
    
    // Generate PDF
    const { pdfFilePath } = await generatePdf(invoiceData);

    // Return the PDF file as download
    res.download(pdfFilePath, `invoice_${orderId}.pdf`);
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({
      success: false,
      message: "Error generating invoice",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrderByToken,
  getAllOrders,
  updateOrderStatus,
  getInvoice,
};
 