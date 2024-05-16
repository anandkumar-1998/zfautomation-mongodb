const mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Your Name"],
        maxLength: [30, "Name cannot exceed 30 characters"],
        minLength: [4, "Name should have more than 4 characters"],
    },
    username: {
        type: String,
        required: [true, "Please Enter Your Username"],
        unique: [true, "Username Already Exists"],
        validate: {
            validator: function (v) {
                return /^[a-z0-9_\.]+$/.test(v);
            },
            message: "Please Enter a valid username"
        },
        // validate: [validator.matches({ VALUE }, '/^[a-z0-9_\.]+$/'), "Please Enter a valid username"],
    },

    phonenumber: {
        type: Number,
        unique: true,
        required: [false, "Please Enter Phone Number"],
        minLength: [10, "Enter Valid Phone Number"],
        maxlength: [10, "Enter Valid Phone Number"],

    },
    password: {
        type: String,
        required: [false, "Please Enter Your Password"],
        minLength: [4, "Password should be greater than 4 characters"],
        select: false,
    },
    accessmodules: {
        type: [String],
        validate: [v => Array.isArray(v) && v.length > 0, "Please Provide Access to Minimum 01 Module"],
    },
    plant: {
        type: String,
        required: [true, "No Plant Details Available"],
    },
    logs: {
        type: [Object],
        required: [true, "No Log Details Available"],
    },
    lastlogin: {
        type: Date,
    },
    isactive: {
        type: Boolean,
        default: false,
        required: false,
    },
    isadmin: {
        type: Boolean,
        default: false,
    },
    issignedup: {
        type: Boolean,
        default: false,
    },
    hasrequestedpasswordreset: {
        type: Boolean,
        default: false,
    },

});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
});

// JWT TOKEN
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id, role: this.role, accessmodules: this.accessmodules }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Compare Password
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// userSchema.plugin(uniqueValidator, { message: 'Error, {VALUE} Already Exists.' });

module.exports = mongoose.model("User", userSchema);