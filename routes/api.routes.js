const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authToken');
const upload = require('../middleware/fileUpload.js');

// Controllers
const cartController = require('../controllers/cartController');
const categoryController = require('../controllers/categoryController');
const orderController = require('../controllers/orderController');
const productController = require('../controllers/productController');
const userController = require('../controllers/userController');
const variantController = require('../controllers/variantController.js')

// Category Routes
router.post("/Category/create", upload.single("image"), categoryController.createCategory);
router.get("/Category/get", categoryController.getCategories);
router.get("/Category/get/:id", categoryController.getCategoryById);
router.patch("/Category/update/:id", upload.single("image"), categoryController.updateCategory);
router.delete("/Category/delete/:id", categoryController.deleteCategory);

// Product Routes
router.post('/Product/create', upload.single('image'), productController.createProducts);
router.get('/Product/get', productController.getProducts);
router.get('/Product/get/:id', productController.getProductById);
router.patch('/Product/update/:id', upload.single('image'), productController.updateProducts);
router.delete('/Product/delete/:id', productController.deleteProducts);

// Cart Routes
router.post('/Cart/add', authenticateToken, cartController.addItemToCart);
router.get('/Cart/token', authenticateToken, cartController.getByToken);
router.patch('/Cart/update', authenticateToken, cartController.updateCartItem);
router.delete('/Cart/remove', authenticateToken, cartController.removeItemFromCart);
router.patch('/Cart/quantity', authenticateToken, cartController.updateCartQuantity);

// User Routes
router.post('/User/register', userController.register);
router.get('/User/get', userController.getUsers);
router.get('/User/details', authenticateToken, userController.getUserById);
router.patch('/User/update/:id', userController.updateUser);
router.delete('/User/delete/:id', userController.deleteUser);
router.post('/User/login', userController.loginUser);
router.post('/User/reset/:id', userController.resetPassword);

// Order Routes
router.post('/Order/create', authenticateToken, orderController.createOrder);
router.get('/Order/getbytoken', authenticateToken, orderController.getOrderByToken);
router.get('/Order/getallorders', orderController.getAllOrders);
router.patch('/Order/status/:orderId', authenticateToken, orderController.updateOrderStatus);
router.get('/Order/Invoice/:orderId',orderController.getInvoice);

//Variant Routes

router.post('/create', variantController.createVariant);

module.exports = router; 
