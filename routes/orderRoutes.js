const express = require('express');
const {createOrder,getOrderByToken,getAllOrders,updateOrderStatus} = require('../controllers/orderController');
const authenticateToken = require('../middleware/authToken');
const router = express.Router();

router.post('/', authenticateToken, createOrder);
router.get('/getbytoken', authenticateToken,getOrderByToken);
router.get('/getallorders', getAllOrders);
router.patch('/status/:orderId',authenticateToken, updateOrderStatus);


module.exports = router;    
