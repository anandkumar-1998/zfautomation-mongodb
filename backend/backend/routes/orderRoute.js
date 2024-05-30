const express = require("express");
const { addOrder, updateOrder } = require("../controllers/orderController");

let router = express.Router();

router.route("/create-order").post(addOrder);
router.route("/update-order").post(updateOrder);

module.exports = router;
