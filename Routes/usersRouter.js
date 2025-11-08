const express = require("express");
const {
  createUser,
  userLogin,
  forgotPassword,
  resetPassword,
} = require("../Controllers/userController.js");

const router = express.Router();

router.route("/signup").post(createUser);
router.route("/login").post(userLogin);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").patch(resetPassword);

module.exports = router;
