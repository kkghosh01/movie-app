const express = require("express");
const {
  createUser,
  userLogin,
  userLogout,
  forgotPassword,
  resetPassword,
} = require("../Controllers/authController.js");

const router = express.Router();

router.route("/signup").post(createUser);
router.route("/login").post(userLogin);
router.route("/logout").get(userLogout);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").patch(resetPassword);

module.exports = router;
