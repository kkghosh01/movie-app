const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  createUser,
  userLogin,
  userLogout,
  forgotPassword,
  resetPassword,
} = require("../Controllers/authController.js");

const router = express.Router();

let limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

router.route("/signup").post(createUser);
router.route("/login").post(limiter, userLogin);
router.route("/logout").get(userLogout);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").patch(resetPassword);

module.exports = router;
