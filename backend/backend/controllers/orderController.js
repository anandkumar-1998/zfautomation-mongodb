const { getClient } = require("../config/database");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");

exports.addOrder = catchAsyncErrors(async (req, res, next) => {
  const { item, total_price, order_address, productId, qty } = req.body;
  const client = await getClient();
  let session = await client.startSession();
  const transactionOptions = {
    readPreference: "primary",
    readConcern: {level: "local"},
    writeConcern: {w:"majority"}
  }
  await session.startTransaction();
  // await session.withTransaction(async()=>{

  // },transactionOptions)
  // session.startTransaction(transactionOptions);
  //   let product = await Product.findOne([{ productId: productId }], {
  //     session: session,
  //   });
  console.log('order')
  for (let i = 0; i < productId.length; i++) {
    let product = await Product.findOne({ productId }).session(session);
    let stq = product.stq - qty[i];
    if(stq > 0){
      product.stq = stq;
      await product.save({session: session});
    }
    else{
      res.status(200).json({success: false, msg: "Can't Order the product "})
      break;
    }
  }

  let order = await Order.create(
    [
      {
        item,
        total_price,
        order_address,
        productId,
      },
    ],
    { session: session }
  );

  await session.commitTransaction();
  res
    .status(200)
    .json({ success: true, message: "Order is created successfully" });
});
