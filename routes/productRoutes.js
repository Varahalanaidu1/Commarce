const express = require('express');
const router = express.Router();
const { getProducts, createProducts, updateProducts, deleteProducts, getProductById } = require('../controllers/productController');
const upload  = require('../middleware/fileUpload');


router.post('/',upload.single('image'),createProducts);
router.get('/', getProducts);
router.get('/:id',getProductById);
router.patch('/:id',upload.single('image'),updateProducts);
router.delete('/:id',deleteProducts);

module.exports = router;
