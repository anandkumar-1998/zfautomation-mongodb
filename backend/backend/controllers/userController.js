const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const crypto = require("crypto");

// add  User
exports.addUser = catchAsyncErrors(async (req, res, next) => {

    const { name,
        username,
        phonenumber,
        isactive,
        isadmin,
        log,
        plant,
        addedbyuserfullname,
        addedbyuseruid,
        accessmodules } = req.body;

    const user = await User.create({
        name,
        username,
        phonenumber,
        log, isadmin,
        plant,
        isactive, addedbyuserfullname,
        addedbyuseruid,
        accessmodules
    });

    sendToken(user, 201, res);
});


// Sign up user --- create / recreate password
exports.signupUser = catchAsyncErrors(async (req, res, next) => {


    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
        return next(new ErrorHander("User not found", 404));
    }

    if (user.issignedup && !user.hasrequestedpasswordreset) {
        return next(new ErrorHander("User Already Have A Password", 404));
    }
    if (!user.issignedup || user.hasrequestedpasswordreset) {

        user.password = password;
        user.issignedup = true;
        user.hasrequestedpasswordreset = false;
        user.lastlogin = new Date();

        await user.save();

        sendToken(user, 200, res);

    } else {
        return next(new ErrorHander("Can't Complete This Request", 404));
    }
});

// Check User
exports.checkUser = catchAsyncErrors(async (req, res, next) => {


    const { username } = req.query;

    console.log("username  : " + username);
    // checking if user has given password and username both

    if (!username) {
        return next(new ErrorHander("Please Enter A Valid Username", 400));
    }

    const user = await User.findOne({ username });

    if (!user) {
        return next(new ErrorHander("Invalid Username or password", 401));
    }

    if (!user.isactive) {
        return next(new ErrorHander("Access to account is disabled, contact administrator", 401));
    }

    res.status(200).json({
        success: true,
        isactive: user.isactive,
        issignedup: user.issignedup,
        name: user.name,
        username: user.username,

    });

});


// Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { username, password } = req.body;

    // checking if user has given password and username both

    if (!username || !password) {
        return next(new ErrorHander("Please Enter Username & Password", 400));
    }

    const user = await User.findOne({ username }).select("+password");

    if (!user) {
        return next(new ErrorHander("Invalid Username or password", 401));
    }
    if (!user.issignedup) {
        return next(new ErrorHander("User Does't Have a Password", 401));
    }
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHander("Invalid Username or password", 401));
    }
    if (!user.isactive) {
        return next(new ErrorHander("Access to account is disabled, contact administrator", 401));
    }

    user.hasrequestedpasswordreset = false;
    user.lastlogin = new Date();
    await user.save();

    sendToken(user, 200, res);
});

// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logged Out",
    });
});

// Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
        return next(new ErrorHander("User not found", 404));
    }

    if (!user.issignedup) {
        return next(new ErrorHander("User Doesn't Have A Password", 404));
    }
    if (user.hasrequestedpasswordreset) {
        return next(new ErrorHander("Password Reset Request Has Already Been Made, Please contact administrator", 404));
    }

    user.hasrequestedpasswordreset = true;

    await user.save();

    sendToken(user, 200, res);
});


// Get User Detail
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });
});

// update User password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHander("Old password is incorrect", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHander("password does not match", 400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);
});

// update User Profile
exports.updateuser = catchAsyncErrors(async (req, res, next) => {
    let user = await User.findById(req.params.id);
    if (!user) {
        return res.status(500).json({
            success: false,
            message: 'User Not Found'
        })
    }

    var userid = req.params.id
    console.log("userid " + userid);
    var log = JSON.parse(JSON.stringify(req.body.log))
    delete req.body.log

    user = await User.findByIdAndUpdate(req.params.id, {
        ...req.body,
        $push: { logs: log },
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});

// Get all users(admin)
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
    var users = []

    await User.find().sort({ "isactive": -1 }).then(function (docs) {
        users = docs;
    })
    res.status(200).json({
        success: true,
        users,
    });
});

// Get single user (admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(
            new ErrorHander(`User does not exist with Id: ${req.params.id}`)
        );
    }

    res.status(200).json({
        success: true,
        user,
    });
});

// update User Role -- Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        username: req.body.username,
        role: req.body.role,
    };

    await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});

// Delete User --Admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(
            new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400)
        );
    }

    await user.remove();

    res.status(200).json({
        success: true,
        message: "User Deleted Successfully",
    });
});