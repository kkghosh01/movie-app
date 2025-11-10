const express = require("express");
const { protect, restrictRole } = require("../Middlewares/authMiddleware.js");
const {
  getPublicUsers,
  getAllUsers,
  getUserProfile,
  updatePassword,
  updateMe,
  deleteMe,
} = require("../Controllers/userController.js");

const router = express.Router();

router.get("/", getPublicUsers);

router.use(protect);
router.route("/me").get(getUserProfile);
router.route("/update-password").patch(updatePassword);
router.route("/update-me").patch(updateMe);
router.route("/delete-me").delete(deleteMe);

// admin only
router.route("/all").get(protect, restrictRole("admin"), getAllUsers);

module.exports = router;
