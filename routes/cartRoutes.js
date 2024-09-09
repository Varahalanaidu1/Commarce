const express = require('express');
const router = express.Router();
const { addItemToCart, getByToken, updateCartItem, removeItemFromCart, updateCartQuantity } = require('../controllers/cartController');
const authenticateToken = require('../middleware/authToken');

router.post('/', authenticateToken, addItemToCart);
router.get('/', authenticateToken, getByToken);
router.patch('/update', authenticateToken, updateCartItem);
router.delete('/remove', authenticateToken, removeItemFromCart);
router.post('/quantity',authenticateToken,updateCartQuantity);

module.exports = router;
