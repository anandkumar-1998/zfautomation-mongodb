const mongoose = require("mongoose");
const moment = require('moment');
const { gen } = require("n-digit-token");
const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    default: ()=> {return "ORDER"+gen(6)}
  },
  productId: {
    type: Array,
    required: [true, "Product Id are required"],
  },
  item: {
    type: Number,
    required: [true, "Order Item is required"],
  },

  total_price: {
    type: Number,
    required: [true, "Order Total Price is required"],
  },

  order_address: {
    type: String,
    required: [true, "Please enter the order address"],
  },

  order_date: {
    type: String,
    default: () => {
      return moment()
        .utcOffset("+05:30")
        .format("MMM DD YYYY hh:mm:ss")
        .toString();
    },
  },
});

orderSchema.post('save', async function(doc){
  console.log("creating the order: ", doc)
})


orderSchema.post("findOneAndUpdate", async function(doc){
  let order = mongoose.model("Order", orderSchema);
  console.log("updating the order: ",await order.findById(doc._id));
})


module.exports = mongoose.model("Order", orderSchema);
