const express = require('express');
const { addProduct } = require('../controllers/productController');

let router = express.Router();

router.route('/addproduct').post(addProduct);



module.exports = router;
