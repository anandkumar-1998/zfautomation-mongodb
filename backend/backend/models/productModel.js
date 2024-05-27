const mongoose = require("mongoose");
let moment = require('moment');
const {gen} = require('n-digit-token')
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter the name of the product"],
    minLength: [5, "Name should have more than 5 characters"],
  },

  productId: {
    type: String,
    default: ()=>{return "PROD"+gen(7)} 
  },

  price: {
    type: Number,
    required: [true, "Pleas enter the price of the product"],
  },

  category: {
    type: String,
    required: [true, "Please enter the category of the product"],
  },

  stq: {
    type: Number,
    // required: [true, "Please enter the stock quanity of the product"],
  },

  added_date: {
    type: String,
    default: () => {
      return moment().utcOffset("+05:30").format('MMM DD YYYY hh:mm:ss').toString();
    },
  },
});

module.exports = mongoose.model("Product", productSchema);
