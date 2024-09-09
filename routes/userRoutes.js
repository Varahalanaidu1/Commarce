const express = require('express');
const router = express.Router();
const { getUsers, updateUser, deleteUser, getUserById, register, loginUser, resetPassword } = require('../controllers/userController');
const authenticateToken = require('../middleware/authToken');


router.post('/',register);
router.get('/',getUsers);
router.get('/details',authenticateToken,getUserById);
router.patch('/:id',updateUser);
router.delete('/:id',deleteUser);
router.post('/login',loginUser);
router.post('/reset/:id',resetPassword);

module.exports = router;

