const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const crypto = require("crypto");

var moment = require('moment');

exports.getLiveDate = catchAsyncErrors(async (req, res, next) => {
    const date = (moment().utcOffset("+05:30").format('MMM DD YYYY')).toString();
    const dateuid = date.replaceAll(" ", "").toLowerCase();
    res.status(200).json({
        success: true,
        data: dateuid,
        message: "OK"
    });

});

