const express = require('express');
const { addOrder } = require('../controllers/orderController');

let router = express.Router();

router.route('/create-order').post(addOrder);


module.exports = router;