const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    const token = extractToken(req);
    if (!token) {
        return next(new ErrorHander("Please Login to access this resource", 401));
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    var user = await User.findById(decodedData.id);

    if (!user) {
        return next(
            new ErrorHander(`Invalid User, Access Denied.`, 400)
        );
    }
    req.user = user;

    next();
});
function extractToken(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
        return req.query.token;
    }
    return null;
}
exports.authorizeModuleAccess = (module) => {
    return (req, res, next) => {
        if (!req.user.accessmodules.includes(module)) {
            return next(
                new ErrorHander(
                    `Module Access Prohibited`,
                    403
                )
            );
        }

        next();
    };
};