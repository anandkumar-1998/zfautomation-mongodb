const { getClient } = require("../config/database");
const Product = require("../models/productModel");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

exports.addProduct = catchAsyncErrors(async (req, res, next) => {
  const { name, price, category,stq } = req.body;
  let product = await Product.create(
      {
        name,
        price,
        category,
        stq
      });
  res.status(200).json({ success: true, message: "Product has been added" });
});
