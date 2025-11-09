const express = require("express");
const { protect } = require("../Middlewares/authMiddleware.js");
const {
  createUser,
  userLogin,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require("../Controllers/authController.js");

const router = express.Router();

router.route("/signup").post(createUser);
router.route("/login").post(userLogin);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").patch(resetPassword);

router.use(protect);
router.route("/update-password").patch(updatePassword);

module.exports = router;
