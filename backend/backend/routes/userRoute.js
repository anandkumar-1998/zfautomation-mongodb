const express = require("express");
const {
    addUser,
    checkUser,
    signupUser,
    loginUser,
    logout,
    forgotPassword,
    getUserDetails,
    updatePassword,
    updateuser,
    getAllUser,
    getSingleUser,
    updateUserRole,
    deleteUser,
} = require("../controllers/userController");
const { isAuthenticatedUser, authorizeModuleAccess } = require("../middleware/auth");

const router = express.Router();

router.route("/adduser").post(addUser);

router.route("/checkuser").get(checkUser);

router.route("/signupuser").post(signupUser);

router.route("/login").post(loginUser);

router.route("/password/forgot").post(forgotPassword);

router.route("/logout").get(logout);

router.route("/me").get(isAuthenticatedUser, getUserDetails);

router.route("/password/update").put(isAuthenticatedUser, updatePassword);

router.route("/updateuser/:id")
    .patch(isAuthenticatedUser, authorizeModuleAccess("EMPLOYEEMASTER"), updateuser)



router
    .route("/admin/users")
    .get(isAuthenticatedUser, authorizeModuleAccess("EMPLOYEEMASTER"), getAllUser);


router
    .route("/admin/user/:id")
    .get(isAuthenticatedUser, authorizeModuleAccess("EMPLOYEEMASTER"), getSingleUser)
    .put(isAuthenticatedUser, authorizeModuleAccess("EMPLOYEEMASTER"), updateUserRole)
    .delete(isAuthenticatedUser, authorizeModuleAccess("EMPLOYEEMASTER"), deleteUser);

module.exports = router;