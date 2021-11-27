const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getLoggedInUser,
  changePassword,
  updateUser,
  adminAllUsers,
  adminGetOneUser,
  adminUpdateOneUser,
  adminDeleteOneUser,
} = require("../controllers/userController");
const { isLoggedIn, customRole } = require("../middlewares/user");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotpassword").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword);
router.route("/password/update").post(isLoggedIn, changePassword);
router.route("/userdashboard").get(isLoggedIn, getLoggedInUser);
router.route("/userdashboard/update").post(isLoggedIn, updateUser);

router
  .route("/admin/users")
  .get(isLoggedIn, customRole("admin"), adminAllUsers);
router
  .route("/admin/users/:id")
  .get(isLoggedIn, customRole("admin"), adminGetOneUser)
  .put(isLoggedIn, customRole("admin"), adminUpdateOneUser)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOneUser);

module.exports.user = router;
